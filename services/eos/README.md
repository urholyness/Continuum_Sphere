# EOS API Services

This folder contains the EOS API integration services for satellite imagery and vegetation analysis.

## Structure

- `client.js` - EOS API client wrapper with authentication
- `imagery.js` - Natural color imagery and vegetation indices
- `stats.js` - Vegetation statistics and time-series analysis
- `README.md` - This documentation

## Setup

### 1. AWS Secrets Manager

Store your EOS API key in AWS Secrets Manager:

```json
{
  "EOS_API_KEY": "your_eos_api_key_here"
}
```

Secret name: `eos/api`
Region: `eu-central-1` (or your preferred region)

### 2. Local Development

For local development, create `.env.local`:

```env
EOS_API_KEY=your_eos_api_key_here
AWS_REGION=eu-central-1
```

### 3. Environment Variables

- `EOS_API_KEY` - Your EOS API key (local dev only)
- `AWS_REGION` - AWS region for Secrets Manager (default: eu-central-1)
- `EOS_SECRET_ID` - Secrets Manager secret ID (default: eos/api)

## Usage

### Natural Color Imagery

```javascript
import { getNaturalColor } from './services/eos/imagery.js';

const geometry = {
  type: "Polygon",
  coordinates: [[[35.2698, 0.5143], [35.2798, 0.5143], [35.2798, 0.5243], [35.2698, 0.5243], [35.2698, 0.5143]]]
};

const naturalColor = await getNaturalColor('view_id_here', geometry, 10);
```

### Vegetation Indices

```javascript
import { getIndexImage, getMultipleIndices } from './services/eos/imagery.js';

// Single index
const ndvi = await getIndexImage('view_id_here', 'NDVI', geometry);

// Multiple indices
const indices = await getMultipleIndices('view_id_here', ['NDVI', 'RECI', 'NDMI'], geometry);
```

### Statistics

```javascript
import { getVegStats, getComprehensiveStats } from './services/eos/stats.js';

// Basic stats
const stats = await getVegStats(['NDVI', 'RECI'], '2025-01-01', '2025-09-20', geometry);

// Comprehensive stats
const comprehensiveStats = await getComprehensiveStats(['NDVI', 'RECI', 'NDMI'], geometry);
```

## API Endpoints (Lambda Integration)

When deployed as Lambda functions behind API Gateway:

- `GET /eos/imagery/natural?view_id=...&geometry=...` - Natural color imagery
- `GET /eos/imagery/index/{NDVI|RECI|NDMI}?view_id=...&geometry=...` - Vegetation indices
- `GET /eos/stats?indices=NDVI,RECI,NDMI&from=2025-07-01&to=2025-09-20&geometry=...` - Statistics

## Caching

Results are cached in S3 with keys: `{viewId}-{bmType}-{geometryHash}`

## Error Handling

All functions include proper error handling and will throw descriptive errors for:
- Authentication failures
- Invalid parameters
- API timeouts
- Task failures

## 2BH Farm Integration

This service is specifically configured for 2BH farm (2 Butterflies Homestead) in Uasin Gishu, Kenya:
- Coordinates: 0.5143, 35.2698
- Area: ~300 hectares (within EOS API limits)
- Supported indices: NDVI, RECI, NDMI, EVI

