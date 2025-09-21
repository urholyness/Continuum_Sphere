# Add Missing API Credentials to .env.local
# This script adds the missing Sentinel Hub and AccuWeather credentials

Write-Host "=== Adding Missing API Credentials to .env.local ===" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Read current content
$currentContent = Get-Content -Raw -Path ".env.local"

# Check if credentials are already added
if ($currentContent -match "SENTINEL_HUB_CLIENT_ID") {
    Write-Host "Sentinel Hub credentials already exist in .env.local" -ForegroundColor Yellow
} else {
    # Add Sentinel Hub credentials
    $sentinelHubCredentials = @"

# Sentinel Hub API (Replace with your actual credentials)
SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret
"@
    
    $currentContent += $sentinelHubCredentials
    Write-Host "Added Sentinel Hub credentials placeholder" -ForegroundColor Green
}

if ($currentContent -match "ACCUWEATHER_API_KEY") {
    Write-Host "AccuWeather credentials already exist in .env.local" -ForegroundColor Yellow
} else {
    # Add AccuWeather credentials
    $accuWeatherCredentials = @"

# AccuWeather API (Replace with your actual API key)
ACCUWEATHER_API_KEY=your_accuweather_api_key
"@
    
    $currentContent += $accuWeatherCredentials
    Write-Host "Added AccuWeather credentials placeholder" -ForegroundColor Green
}

# Write updated content back to file
$currentContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ Updated .env.local with missing API credentials" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local and replace the placeholder values with your actual API keys:" -ForegroundColor White
Write-Host "   - SENTINEL_HUB_CLIENT_ID=your_actual_client_id" -ForegroundColor Cyan
Write-Host "   - SENTINEL_HUB_CLIENT_SECRET=your_actual_client_secret" -ForegroundColor Cyan
Write-Host "   - ACCUWEATHER_API_KEY=your_actual_api_key" -ForegroundColor Cyan
Write-Host "2. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "3. Test the APIs again" -ForegroundColor White
Write-Host ""
Write-Host "To get your API keys:" -ForegroundColor Yellow
Write-Host "• Sentinel Hub: https://apps.sentinel-hub.com/" -ForegroundColor White
Write-Host "• AccuWeather: https://developer.accuweather.com/" -ForegroundColor White

