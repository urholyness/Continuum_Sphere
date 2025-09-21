// New Comprehensive Satellite API Service
// This API provides natural color, vegetation indices, weather, and more for 2BH farm

import { getNewSatelliteAPICredentials } from './aws-secrets';

interface FarmCoordinates {
  lat: number;
  lng: number;
}

interface SatelliteData {
  naturalColor: {
    imageUrl: string;
    lastUpdated: string;
    quality: 'high' | 'medium' | 'low';
  };
  vegetationIndices: {
    ndvi: number;
    ndwi: number;
    evi: number;
    lastUpdated: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    lastUpdated: string;
  };
  farmMetrics: {
    area: number;
    coverage: number;
    healthScore: number;
    lastUpdated: string;
  };
}

export async function getComprehensiveFarmData(farmId: string, coordinates: FarmCoordinates): Promise<SatelliteData | null> {
  try {
    const credentials = await getNewSatelliteAPICredentials();
    
    // Check if this farm is supported (only 2BH for now)
    if (farmId !== credentials.farmId) {
      throw new Error(`Farm ${farmId} not supported. This API only supports ${credentials.farmId}`);
    }

    console.log(`Fetching comprehensive data for ${farmId} using new satellite API...`);

    // Make API call to the new comprehensive service
    const response = await fetch(`${credentials.baseUrl}/api/farm-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farmId: farmId,
        coordinates: coordinates,
        features: credentials.features,
        maxArea: credentials.maxArea
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform the API response to our standardized format
    const satelliteData: SatelliteData = {
      naturalColor: {
        imageUrl: data.natural_color?.image_url || '',
        lastUpdated: data.natural_color?.timestamp || new Date().toISOString(),
        quality: data.natural_color?.quality || 'medium'
      },
      vegetationIndices: {
        ndvi: data.vegetation_indices?.ndvi || 0,
        ndwi: data.vegetation_indices?.ndwi || 0,
        evi: data.vegetation_indices?.evi || 0,
        lastUpdated: data.vegetation_indices?.timestamp || new Date().toISOString()
      },
      weather: {
        temperature: data.weather?.temperature || 0,
        humidity: data.weather?.humidity || 0,
        precipitation: data.weather?.precipitation || 0,
        windSpeed: data.weather?.wind_speed || 0,
        lastUpdated: data.weather?.timestamp || new Date().toISOString()
      },
      farmMetrics: {
        area: data.farm_metrics?.area || 0,
        coverage: data.farm_metrics?.coverage || 0,
        healthScore: data.farm_metrics?.health_score || 0,
        lastUpdated: data.farm_metrics?.timestamp || new Date().toISOString()
      }
    };

    console.log(`Successfully fetched comprehensive data for ${farmId}`);
    return satelliteData;

  } catch (error) {
    console.error(`Error fetching comprehensive data for ${farmId}:`, error);
    return null;
  }
}

// Test function for the new API
export async function testNewSatelliteAPI(farmId: string, coordinates: FarmCoordinates): Promise<{
  status: 'success' | 'failure';
  message: string;
  data?: any;
}> {
  try {
    console.log(`🛰️ Testing EOS API for farm ${farmId}...`);
    // Temporarily disabled: experimental API routes removed in cleanup
    return {
      status: 'failure',
      message: 'EOS test route removed during cleanup'
    };

  } catch (error: any) {
    console.error(`❌ EOS API test failed for ${farmId}:`, error);
    return {
      status: 'failure',
      message: `Failed to test EOS API for ${farmId}: ${error.message}`
    };
  }
}
