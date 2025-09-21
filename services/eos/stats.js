// EOS Statistics Service
// Handles vegetation indices time-series statistics

import { eosRequest, pollTaskResult, generateGeometryHash } from "./client.js";

/**
 * Get vegetation statistics for a farm over a time period
 * @param {string[]} indices - Array of vegetation indices (max 3 per request)
 * @param {string} dateStart - Start date in YYYY-MM-DD format
 * @param {string} dateEnd - End date in YYYY-MM-DD format
 * @param {object} geometry - GeoJSON geometry of the farm
 * @returns {Promise<object>} Vegetation statistics data
 */
export async function getVegStats(indices, dateStart, dateEnd, geometry) {
  // Validate indices limit
  if (indices.length > 3) {
    throw new Error('Maximum 3 indices allowed per request');
  }
  
  const body = {
    type: "mt_stats",
    params: {
      bm_type: indices.join(','),
      date_start: dateStart,
      date_end: dateEnd,
      geometry,
      sensors: ["sentinel2"],
      reference: `stats_${Date.now()}`
    }
  };
  
  const result = await eosRequest("/gdw/api?api_key=inline", body);
  
  // Poll for completion if task was created
  if (result.task_id) {
    const completedResult = await pollTaskResult(result.task_id);
    return {
      ...completedResult,
      geometry_hash: generateGeometryHash(geometry),
      indices: indices,
      date_range: { start: dateStart, end: dateEnd }
    };
  }
  
  return result;
}

/**
 * Get comprehensive farm statistics for multiple time periods
 * @param {string[]} indices - Array of vegetation indices
 * @param {object} geometry - GeoJSON geometry of the farm
 * @param {object} timePeriods - Object with time period configurations
 * @returns {Promise<object>} Comprehensive statistics data
 */
export async function getComprehensiveStats(indices, geometry, timePeriods = {
  last_30_days: { start: getDateDaysAgo(30), end: getDateDaysAgo(0) },
  last_90_days: { start: getDateDaysAgo(90), end: getDateDaysAgo(0) },
  last_year: { start: getDateDaysAgo(365), end: getDateDaysAgo(0) }
}) {
  try {
    const statsPromises = Object.entries(timePeriods).map(async ([period, dates]) => {
      // Split indices into chunks of 3 for API limits
      const indexChunks = chunkArray(indices, 3);
      const chunkResults = await Promise.all(
        indexChunks.map(chunk => getVegStats(chunk, dates.start, dates.end, geometry))
      );
      
      return {
        period,
        dates,
        data: chunkResults.flat()
      };
    });
    
    const results = await Promise.all(statsPromises);
    
    return {
      farm_geometry: geometry,
      statistics: results.reduce((acc, result) => {
        acc[result.period] = result.data;
        return acc;
      }, {}),
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting comprehensive stats:', error);
    throw new Error(`Failed to get comprehensive stats: ${error.message}`);
  }
}

/**
 * Get farm health score based on vegetation indices
 * @param {object} stats - Statistics data from getVegStats
 * @returns {object} Health score analysis
 */
export function calculateFarmHealthScore(stats) {
  try {
    // This is a simplified health score calculation
    // In production, this would be more sophisticated
    const ndviData = stats.data?.find(item => item.index === 'NDVI');
    const ndwiData = stats.data?.find(item => item.index === 'NDWI');
    
    if (!ndviData || !ndwiData) {
      return { score: 0, status: 'insufficient_data', message: 'Insufficient data for health calculation' };
    }
    
    // Calculate average NDVI and NDWI
    const avgNdvi = ndviData.values?.reduce((sum, val) => sum + val, 0) / ndviData.values?.length || 0;
    const avgNdwi = ndwiData.values?.reduce((sum, val) => sum + val, 0) / ndwiData.values?.length || 0;
    
    // Simple health score (0-100)
    const healthScore = Math.round((avgNdvi * 50) + (avgNdwi * 50));
    const status = healthScore >= 70 ? 'excellent' : healthScore >= 50 ? 'good' : healthScore >= 30 ? 'fair' : 'poor';
    
    return {
      score: Math.max(0, Math.min(100, healthScore)),
      status,
      metrics: {
        avg_ndvi: avgNdvi,
        avg_ndwi: avgNdwi
      },
      message: `Farm health: ${status} (${healthScore}/100)`
    };
  } catch (error) {
    console.error('Error calculating health score:', error);
    return { score: 0, status: 'error', message: 'Error calculating health score' };
  }
}

// Helper functions
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

