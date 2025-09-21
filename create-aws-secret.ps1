# Create AWS Secrets Manager Secret for GSG API Credentials
# This script helps you create the secret structure in AWS

Write-Host "=== Create AWS Secrets Manager Secret ===" -ForegroundColor Green
Write-Host ""

# Check if AWS credentials are configured
if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY) {
    Write-Host "ERROR: AWS credentials not configured!" -ForegroundColor Red
    Write-Host "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can do this by:" -ForegroundColor Cyan
    Write-Host "1. Running: .\setup-aws-credentials.ps1" -ForegroundColor White
    Write-Host "2. Or manually setting the environment variables" -ForegroundColor White
    exit 1
}

Write-Host "AWS credentials found!" -ForegroundColor Green
Write-Host ""

# Read the template file
$templatePath = "create-secret-template.json"
if (-not (Test-Path $templatePath)) {
    Write-Host "ERROR: Template file not found: $templatePath" -ForegroundColor Red
    exit 1
}

$secretValue = Get-Content $templatePath -Raw
Write-Host "Template loaded. Current structure:" -ForegroundColor Cyan
Write-Host $secretValue -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Do you want to create/update the secret 'gsg-api-credentials' with this template? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

try {
    # Create or update the secret
    Write-Host "Creating/updating secret..." -ForegroundColor Yellow
    
    # Use AWS CLI to create/update the secret
    $result = aws secretsmanager put-secret-value --secret-id "gsg-api-credentials" --secret-string $secretValue --region "eu-north-1" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Secret created/updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Go to AWS Console > Secrets Manager > gsg-api-credentials" -ForegroundColor White
        Write-Host "2. Click 'Retrieve secret value' and 'Edit'" -ForegroundColor White
        Write-Host "3. Replace the placeholder values with your actual API keys" -ForegroundColor White
        Write-Host "4. Save the changes" -ForegroundColor White
        Write-Host "5. Open the site at http://localhost:3000 and use the F&F Fund page" -ForegroundColor White
    } else {
        Write-Host "ERROR: Failed to create/update secret:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Exception occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

