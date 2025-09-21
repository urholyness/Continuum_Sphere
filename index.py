import json
import boto3
import urllib.request
import urllib.parse
import base64
from datetime import datetime, timedelta

secrets = boto3.client('secretsmanager', region_name='eu-north-1')

def lambda_handler(event, context):
    farm_id = 'FARM-001'
    if event and 'queryStringParameters' in event:
        params = event['queryStringParameters']
        if params and 'farm_id' in params:
            farm_id = params['farm_id']
    
    farms = {
        'FARM-001': {
            'name': '2 Butterflies Homestead',
            'location': 'Kapseret North',
            'crop': 'French Beans',
	    'production': 'Currently - 4.5 tons/week',	
            'bbox': [36.423, -0.727, 36.443, -0.707],
            'coordinates': {'lat': -0.7167, 'lng': 36.4333}
        },
        'FARM-002': {
            'name': 'NoahsJoy Farms',
            'location': 'Kapseret South',
            'crop': 'Purple Passion Fruit',
            'production': 'Pre-harvest potential 1.5 tons/week',
            'bbox': [35.246783, 0.326406, 35.266783, 0.346406],
            'coordinates': {'lat': 0.336406, 'lng': 35.256783}
        },
        'FARM-003': {
            'name': 'NoahsJoy Farms',
            'location': 'Kapseret South',  
            'crop': 'African Birds Eye Chili',
            'production': 'Pre-harvest potential 1.5 tons/week',
            'bbox': [35.247153, 0.326706, 35.267153, 0.346706],
            'coordinates': {'lat': 0.336706, 'lng': 35.257153}
        }
    }
    
    farm = farms.get(farm_id, farms['FARM-001'])
    
    try:
        # Get credentials
        secret_response = secrets.get_secret_value(SecretId='/C_N/PROD/Sentinel/Credentials')
        creds = json.loads(secret_response['SecretString'])
        
        # Get OAuth token
        token_data = urllib.parse.urlencode({
            'grant_type': 'client_credentials',
            'client_id': creds.get('client_id', ''),
            'client_secret': creds.get('client_secret', '')
        }).encode()
        
        token_req = urllib.request.Request(
            'https://services.sentinel-hub.com/oauth/token',
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(token_req) as response:
            token_json = json.loads(response.read())
            access_token = token_json['access_token']
        
        # Evalscript for true-color + NDVI composite
        evalscript = """//VERSION=3
function setup() {
    return {
        input: ["B02", "B03", "B04", "B08", "dataMask"],
        output: [
            { id: "truecolor", bands: 4 },
            { id: "ndvi", bands: 1, sampleType: "FLOAT32" }
        ]
    };
}

function evaluatePixel(sample) {
    // Calculate NDVI
    let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
    
    // True color RGB
    let gain = 2.5;
    let rgb = [sample.B04 * gain, sample.B03 * gain, sample.B02 * gain];
    
    // Create composite: true-color with NDVI overlay
    let alpha = sample.dataMask;
    
    // Apply NDVI color ramp overlay with 40% opacity
    if (ndvi < -0.2) {
        // Water/snow - blue
        rgb[0] = rgb[0] * 0.6 + 0.4 * 0.05;
        rgb[1] = rgb[1] * 0.6 + 0.4 * 0.05;
        rgb[2] = rgb[2] * 0.6 + 0.4 * 0.8;
    } else if (ndvi < 0.1) {
        // Bare soil - brown
        rgb[0] = rgb[0] * 0.6 + 0.4 * 0.7;
        rgb[1] = rgb[1] * 0.6 + 0.4 * 0.4;
        rgb[2] = rgb[2] * 0.6 + 0.4 * 0.2;
    } else if (ndvi < 0.3) {
        // Sparse vegetation - yellow
        rgb[0] = rgb[0] * 0.6 + 0.4 * 0.9;
        rgb[1] = rgb[1] * 0.6 + 0.4 * 0.9;
        rgb[2] = rgb[2] * 0.6 + 0.4 * 0.2;
    } else if (ndvi < 0.5) {
        // Moderate vegetation - light green
        rgb[0] = rgb[0] * 0.6 + 0.4 * 0.5;
        rgb[1] = rgb[1] * 0.6 + 0.4 * 0.8;
        rgb[2] = rgb[2] * 0.6 + 0.4 * 0.2;
    } else {
        // Dense vegetation - dark green
        rgb[0] = rgb[0] * 0.6 + 0.4 * 0.1;
        rgb[1] = rgb[1] * 0.6 + 0.4 * 0.6;
        rgb[2] = rgb[2] * 0.6 + 0.4 * 0.1;
    }
    
    return {
        truecolor: [...rgb, alpha],
        ndvi: [ndvi]
    };
}"""
        
        # Process API request for imagery
        process_request = {
            "input": {
                "bounds": {
                    "bbox": farm['bbox'],
                    "properties": {
                        "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": (datetime.now() - timedelta(days=30)).isoformat() + "Z",
                            "to": datetime.now().isoformat() + "Z"
                        },
                        "maxCloudCoverage": 20
                    }
                }]
            },
            "output": {
                "width": 512,
                "height": 512,
                "responses": [{
                    "identifier": "truecolor",
                    "format": {
                        "type": "image/png"
                    }
                }]
            },
            "evalscript": evalscript
        }
        
        # Get the image
        img_req = urllib.request.Request(
            'https://services.sentinel-hub.com/api/v1/process',
            data=json.dumps(process_request).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'Accept': 'image/png'
            }
        )
        
        with urllib.request.urlopen(img_req) as response:
            image_data = response.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Also get NDVI statistics using Statistical API
        stats_request = {
            "input": {
                "bounds": {
                    "bbox": farm['bbox'],
                    "properties": {
                        "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": (datetime.now() - timedelta(days=10)).isoformat() + "Z",
                            "to": datetime.now().isoformat() + "Z"
                        },
                        "maxCloudCoverage": 30
                    }
                }]
            },
            "aggregation": {
                "timeRange": {
                    "from": (datetime.now() - timedelta(days=10)).isoformat() + "Z",
                    "to": datetime.now().isoformat() + "Z"
                },
                "aggregationInterval": {
                    "of": "P10D"
                },
                "evalscript": """//VERSION=3
function setup() {
    return {
        input: [{bands: ["B04", "B08", "dataMask"]}],
        output: [{id: "ndvi", bands: 1}, {id: "dataMask", bands: 1}]
    };
}
function evaluatePixel(samples) {
    let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
    return {ndvi: [ndvi], dataMask: [samples.dataMask]};
}"""
            }
        }
        
        stats_req = urllib.request.Request(
            'https://services.sentinel-hub.com/api/v1/statistics',
            data=json.dumps(stats_request).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        )
        
        ndvi_mean = None
        with urllib.request.urlopen(stats_req) as response:
            stats_data = json.loads(response.read())
            if stats_data.get('data') and len(stats_data['data']) > 0:
                ndvi_stats = stats_data['data'][0]['outputs']['ndvi']['bands']['B0']['stats']
                ndvi_mean = round(ndvi_stats.get('mean', 0), 3)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'farmId': farm_id,
                'farmName': farm['name'],
                'location': farm['location'],
                'crop': farm['crop'],
                'production': farm.get('production', 'N/A'),
                'coordinates': farm['coordinates'],
                'ndvi': ndvi_mean,
                'satelliteImage': f'data:image/png;base64,{image_base64}',
                'imageType': 'truecolor_ndvi_composite',
                'timestamp': datetime.now().isoformat(),
                'dataSource': 'sentinel-hub-process-api'
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'farmId': farm_id,
                'farmName': farm['name'],
                'location': farm['location'],
                'crop': farm['crop'],
                'coordinates': farm['coordinates'],
                'error': str(e)[:200],
                'timestamp': datetime.now().isoformat()
            })
        }
