// AWS Secrets Manager Integration
// Connects to real API credentials stored in AWS Secrets Manager

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ 
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

interface APICredentials {
  newSatelliteAPI: {
    apiKey: string;
    baseUrl: string;
    farmId: string;
    maxArea: number;
    features: string[];
  };
  sentinelHub: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
  };
  accuWeather: {
    apiKey: string;
    baseUrl: string;
  };
  alchemy: {
    apiKey: string;
    network: string;
  };
  infura: {
    projectId: string;
    projectSecret: string;
  };
}

let cachedCredentials: APICredentials | null = null;

export async function getAPICredentials(): Promise<APICredentials> {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // Check if AWS credentials are configured
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
  
  // For local development, try to use environment variables first
  if (process.env.SENTINEL_HUB_CLIENT_ID && process.env.SENTINEL_HUB_CLIENT_SECRET && process.env.ACCUWEATHER_API_KEY) {
    console.log('Using local environment variables for API credentials');
    cachedCredentials = {
      newSatelliteAPI: {
        apiKey: process.env.EOS_API_KEY || '',
        baseUrl: 'https://api-connect.eos.com/api',
        farmId: '2BH',
        maxArea: 300,
        features: ['natural_color', 'vegetation_indices', 'weather']
      },
      sentinelHub: {
        clientId: process.env.SENTINEL_HUB_CLIENT_ID,
        clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET,
        apiUrl: 'https://services.sentinel-hub.com'
      },
      accuWeather: {
        apiKey: process.env.ACCUWEATHER_API_KEY,
        baseUrl: 'http://dataservice.accuweather.com'
      },
      alchemy: {
        apiKey: process.env.ALCHEMY_API_KEY || '',
        network: 'mainnet'
      },
      infura: {
        projectId: process.env.INFURA_PROJECT_ID || '',
        projectSecret: process.env.INFURA_PROJECT_SECRET || ''
      }
    };
    return cachedCredentials;
  }
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: 'gsg-api-credentials'
    });
    
    const response = await secretsClient.send(command);
    
    if (!response.SecretString) {
      throw new Error('No secret string found');
    }
    
    cachedCredentials = JSON.parse(response.SecretString);
    return cachedCredentials!;
  } catch (error) {
    console.error('Failed to fetch API credentials:', error);
    throw new Error('Unable to retrieve API credentials from AWS Secrets Manager. Please check your AWS credentials and permissions.');
  }
}

// Individual credential getters for specific APIs
export async function getNewSatelliteAPICredentials() {
  const credentials = await getAPICredentials();
  return credentials.newSatelliteAPI;
}

export async function getSentinelHubCredentials() {
  const credentials = await getAPICredentials();
  return credentials.sentinelHub;
}

export async function getAccuWeatherCredentials() {
  const credentials = await getAPICredentials();
  return credentials.accuWeather;
}

export async function getBlockchainCredentials() {
  const credentials = await getAPICredentials();
  return {
    alchemy: credentials.alchemy,
    infura: credentials.infura
  };
}

// Clear cache (useful for testing or credential rotation)
export function clearCredentialsCache() {
  cachedCredentials = null;
}

