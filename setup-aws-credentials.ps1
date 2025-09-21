# AWS Credentials Setup Script for Local Development
# This script helps you set up AWS credentials for local testing

Write-Host "=== AWS Credentials Setup for Local Development ===" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "Found existing .env.local file" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "Please provide your AWS credentials:" -ForegroundColor Cyan
Write-Host "You can find these in the AWS Console under IAM > Users > Your User > Security credentials" -ForegroundColor Gray
Write-Host ""

$accessKeyId = Read-Host "Enter your AWS Access Key ID"
$secretAccessKey = Read-Host "Enter your AWS Secret Access Key" -AsSecureString
$region = Read-Host "Enter AWS Region (default: eu-north-1)" 

if ([string]::IsNullOrEmpty($region)) {
    $region = "eu-north-1"
}

# Convert SecureString to plain text
$secretAccessKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretAccessKey))

# Create .env.local file
$envContent = @"
# AWS Credentials for Local Development
AWS_ACCESS_KEY_ID=$accessKeyId
AWS_SECRET_ACCESS_KEY=$secretAccessKeyPlain
AWS_REGION=$region
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS: AWS credentials configured successfully!" -ForegroundColor Green
Write-Host "File: Credentials saved to .env.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server (npm run dev)" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 and use the F&F Fund page" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: Security Note: Never commit .env.local to version control!" -ForegroundColor Red