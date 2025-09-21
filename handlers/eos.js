// EOS API Lambda Handlers
// Handles API Gateway requests for EOS satellite services

import { getNaturalColor, getIndexImage, getComprehensiveImagery } from '../services/eos/imagery.js';
import { getVegStats, getComprehensiveStats, calculateFarmHealthScore } from '../services/eos/stats.js';

/**
 * Lambda handler for natural color imagery
 */
export async function naturalColorHandler(event) {
  try {
    const { view_id, geometry } = event.queryStringParameters || {};
    const pxSize = parseInt(event.queryStringParameters?.px_size) || 10;
    
    if (!view_id || !geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: view_id, geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const result = await getNaturalColor(view_id, parsedGeometry, pxSize);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Natural color handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Lambda handler for vegetation index imagery
 */
export async function indexImageHandler(event) {
  try {
    const { index } = event.pathParameters || {};
    const { view_id, geometry } = event.queryStringParameters || {};
    
    if (!index || !view_id || !geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: index, view_id, geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const result = await getIndexImage(view_id, index, parsedGeometry);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Index image handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Lambda handler for comprehensive imagery (natural color + all indices)
 */
export async function comprehensiveImageryHandler(event) {
  try {
    const { view_id, geometry, indices } = event.queryStringParameters || {};
    
    if (!view_id || !geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: view_id, geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const indicesArray = indices ? indices.split(',') : ['NDVI', 'RECI', 'NDMI', 'EVI'];
    
    const result = await getComprehensiveImagery(view_id, parsedGeometry, indicesArray);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Comprehensive imagery handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Lambda handler for vegetation statistics
 */
export async function statsHandler(event) {
  try {
    const { indices, from, to, geometry } = event.queryStringParameters || {};
    
    if (!indices || !from || !to || !geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: indices, from, to, geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const indicesArray = indices.split(',');
    
    const result = await getVegStats(indicesArray, from, to, parsedGeometry);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Stats handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Lambda handler for comprehensive statistics
 */
export async function comprehensiveStatsHandler(event) {
  try {
    const { indices, geometry } = event.queryStringParameters || {};
    
    if (!geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameter: geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const indicesArray = indices ? indices.split(',') : ['NDVI', 'RECI', 'NDMI', 'EVI'];
    
    const result = await getComprehensiveStats(indicesArray, parsedGeometry);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Comprehensive stats handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Lambda handler for farm health score
 */
export async function healthScoreHandler(event) {
  try {
    const { indices, from, to, geometry } = event.queryStringParameters || {};
    
    if (!indices || !from || !to || !geometry) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: indices, from, to, geometry' })
      };
    }
    
    const parsedGeometry = JSON.parse(geometry);
    const indicesArray = indices.split(',');
    
    const stats = await getVegStats(indicesArray, from, to, parsedGeometry);
    const healthScore = calculateFarmHealthScore(stats);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        health_score: healthScore,
        statistics: stats,
        farm_geometry: parsedGeometry
      })
    };
  } catch (error) {
    console.error('Health score handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Main Lambda handler router
 */
export async function handler(event) {
  const { httpMethod, path } = event;
  
  // Route based on path
  if (path.includes('/eos/imagery/natural')) {
    return naturalColorHandler(event);
  } else if (path.includes('/eos/imagery/index/')) {
    return indexImageHandler(event);
  } else if (path.includes('/eos/imagery/comprehensive')) {
    return comprehensiveImageryHandler(event);
  } else if (path.includes('/eos/stats/health')) {
    return healthScoreHandler(event);
  } else if (path.includes('/eos/stats/comprehensive')) {
    return comprehensiveStatsHandler(event);
  } else if (path.includes('/eos/stats')) {
    return statsHandler(event);
  } else {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Endpoint not found' })
    };
  }
}

