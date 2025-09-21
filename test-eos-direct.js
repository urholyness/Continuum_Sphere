// Direct EOS API Test
// This script tests the EOS API directly with your API key

const axios = require('axios');

async function testEOSAPI() {
  const apiKey = 'apk.22ba0cbffd7f5d9ba3f8e2b9e8f7dde565687e60597e54f676fd08ba1ea933d7';
  const baseUrl = 'https://api-connect.eos.com/api';
  
  console.log('🛰️ Testing EOS API directly...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('Base URL:', baseUrl);
  
  try {
    // Test 1: Simple connection test
    console.log('\n📡 Test 1: Connection Test');
    const connectionResponse = await axios.get(`${baseUrl}/test`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Connection successful:', connectionResponse.status);
  } catch (error) {
    console.log('❌ Connection test failed:', error.response?.status, error.response?.statusText);
  }
  
  try {
    // Test 2: Natural color imagery request
    console.log('\n🖼️ Test 2: Natural Color Imagery Request');
    const naturalColorResponse = await axios.post(`${baseUrl}/gdw/api`, {
      type: "jpeg",
      params: {
        view_id: "test_view_2bh",
        bm_type: "B04,B03,B02",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [35.2698, 0.5143],
            [35.2798, 0.5143], 
            [35.2798, 0.5243],
            [35.2698, 0.5243],
            [35.2698, 0.5143]
          ]]
        },
        px_size: 10,
        format: "png",
        reference: `natcolor_${Date.now()}`
      }
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Natural color request successful:', naturalColorResponse.status);
    console.log('Response data:', naturalColorResponse.data);
  } catch (error) {
    console.log('❌ Natural color request failed:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
  
  try {
    // Test 3: Vegetation index request (NDVI)
    console.log('\n🌱 Test 3: NDVI Vegetation Index Request');
    const ndviResponse = await axios.post(`${baseUrl}/gdw/api`, {
      type: "bandmath",
      params: {
        view_id: "test_view_2bh",
        bm_type: "NDVI",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [35.2698, 0.5143],
            [35.2798, 0.5143], 
            [35.2798, 0.5243],
            [35.2698, 0.5243],
            [35.2698, 0.5143]
          ]]
        },
        name_alias: "NDVI",
        reference: `ndvi_${Date.now()}`
      }
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ NDVI request successful:', ndviResponse.status);
    console.log('Response data:', ndviResponse.data);
  } catch (error) {
    console.log('❌ NDVI request failed:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
  
  console.log('\n🏁 EOS API testing completed');
}

testEOSAPI().catch(console.error);

