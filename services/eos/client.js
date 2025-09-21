// EOS API Client Wrapper
// Handles authentication and API requests to EOS services

import axios from "axios";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const REGION = process.env.AWS_REGION || "eu-central-1";
const SECRET_ID = process.env.EOS_SECRET_ID || "eos/api";
const BASE = "https://api-connect.eos.com/api";

/**
 * Get EOS API key from AWS Secrets Manager or local environment
 */
async function getKey() {
  // Local development fallback
  if (process.env.EOS_API_KEY) {
    console.log('Using EOS API key from environment variables');
    return process.env.EOS_API_KEY;
  }
  
  // Production: fetch from AWS Secrets Manager
  try {
    const sm = new SecretsManagerClient({ region: REGION });
    const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
    const secret = JSON.parse(SecretString);
    console.log('Using EOS API key from AWS Secrets Manager');
    return secret.EOS_API_KEY;
  } catch (error) {
    console.error('Failed to get EOS API key from AWS Secrets Manager:', error);
    throw new Error('EOS API key not found in environment variables or AWS Secrets Manager');
  }
}

/**
 * Make authenticated request to EOS API
 * @param {string} path - API endpoint path
 * @param {object} body - Request body
 * @returns {Promise<object>} API response
 */
export async function eosRequest(path, body) {
  try {
    const key = await getKey();
    const response = await axios.post(`${BASE}${path}`, body, {
      headers: { 
        "x-api-key": key, 
        "Content-Type": "application/json" 
      }
    });
    return response.data;
  } catch (error) {
    console.error('EOS API request failed:', error.response?.data || error.message);
    throw new Error(`EOS API request failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Poll EOS task result until completion
 * @param {string} taskId - EOS task ID
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Promise<object>} Task result
 */
export async function pollTaskResult(taskId, maxAttempts = 30, intervalMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await eosRequest(`/gdw/status/${taskId}`, {});
      
      if (result.status === 'completed') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error(`EOS task failed: ${result.error || 'Unknown error'}`);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(`EOS task timeout after ${maxAttempts} attempts`);
}

/**
 * Generate geometry hash for caching
 * @param {object} geometry - GeoJSON geometry
 * @returns {string} Hash string
 */
export function generateGeometryHash(geometry) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(JSON.stringify(geometry)).digest('hex').substring(0, 8);
}
