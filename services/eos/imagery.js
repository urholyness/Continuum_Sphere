// EOS Imagery Service
// Handles natural color imagery and vegetation indices

import { eosRequest, pollTaskResult, generateGeometryHash } from "./client.js";

/**
 * Get natural color imagery for a farm
 * @param {string} viewId - EOS view ID
 * @param {object} geometry - GeoJSON geometry of the farm
 * @param {number} pxSize - Pixel size in meters (default: 10)
 * @returns {Promise<object>} Natural color image data
 */
export async function getNaturalColor(viewId, geometry, pxSize = 10) {
  const body = {
    type: "jpeg",
    params: {
      view_id: viewId,
      bm_type: "B04,B03,B02", // RGB bands for natural color
      geometry,
      px_size: pxSize,
      format: "png",
      reference: `natcolor_${Date.now()}`
    }
  };
  
  const result = await eosRequest("/gdw/api", body);
  
  // Poll for completion if task was created
  if (result.task_id) {
    const completedResult = await pollTaskResult(result.task_id);
    return {
      ...completedResult,
      geometry_hash: generateGeometryHash(geometry),
      image_type: 'natural_color'
    };
  }
  
  return result;
}

/**
 * Get vegetation index imagery
 * @param {string} viewId - EOS view ID
 * @param {string} index - Vegetation index type (NDVI, RECI, NDMI, etc.)
 * @param {object} geometry - GeoJSON geometry of the farm
 * @returns {Promise<object>} Vegetation index image data
 */
export async function getIndexImage(viewId, index, geometry) {
  const body = {
    type: "bandmath",
    params: {
      view_id: viewId,
      bm_type: index,
      geometry,
      name_alias: index,
      reference: `${index}_${Date.now()}`
    }
  };
  
  const result = await eosRequest("/gdw/api", body);
  
  // Poll for completion if task was created
  if (result.task_id) {
    const completedResult = await pollTaskResult(result.task_id);
    return {
      ...completedResult,
      geometry_hash: generateGeometryHash(geometry),
      image_type: 'vegetation_index',
      index_type: index
    };
  }
  
  return result;
}

/**
 * Get multiple vegetation indices for a farm
 * @param {string} viewId - EOS view ID
 * @param {string[]} indices - Array of vegetation index types
 * @param {object} geometry - GeoJSON geometry of the farm
 * @returns {Promise<object[]>} Array of vegetation index data
 */
export async function getMultipleIndices(viewId, indices, geometry) {
  const promises = indices.map(index => getIndexImage(viewId, index, geometry));
  return Promise.all(promises);
}

/**
 * Get comprehensive farm imagery (natural color + all indices)
 * @param {string} viewId - EOS view ID
 * @param {object} geometry - GeoJSON geometry of the farm
 * @param {string[]} indices - Array of vegetation index types
 * @returns {Promise<object>} Complete imagery data
 */
export async function getComprehensiveImagery(viewId, geometry, indices = ['NDVI', 'RECI', 'NDMI', 'EVI']) {
  try {
    const [naturalColor, ...vegetationIndices] = await Promise.all([
      getNaturalColor(viewId, geometry),
      ...indices.map(index => getIndexImage(viewId, index, geometry))
    ]);
    
    return {
      natural_color: naturalColor,
      vegetation_indices: vegetationIndices.reduce((acc, result, index) => {
        acc[indices[index]] = result;
        return acc;
      }, {}),
      farm_geometry: geometry,
      view_id: viewId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting comprehensive imagery:', error);
    throw new Error(`Failed to get comprehensive imagery: ${error.message}`);
  }
}

