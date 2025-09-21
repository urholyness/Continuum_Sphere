@echo off
echo === AWS Credentials Setup for Local Development ===
echo.

REM Check if .env.local exists
if exist ".env.local" (
    echo Found existing .env.local file
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b
    )
)

echo Please provide your AWS credentials:
echo You can find these in the AWS Console under IAM ^> Users ^> Your User ^> Security credentials
echo.

set /p accessKeyId="Enter your AWS Access Key ID: "
set /p secretAccessKey="Enter your AWS Secret Access Key: "
set /p region="Enter AWS Region (default: eu-north-1): "

if "%region%"=="" set region=eu-north-1

REM Create .env.local file
(
echo # AWS Credentials for Local Development
echo AWS_ACCESS_KEY_ID=%accessKeyId%
echo AWS_SECRET_ACCESS_KEY=%secretAccessKey%
echo AWS_REGION=%region%
) > .env.local

echo.
echo ✅ AWS credentials configured successfully!
echo 📁 Credentials saved to .env.local
echo.
echo Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Open http://localhost:3000 and use the F&F Fund page
echo.
echo ⚠️  Security Note: Never commit .env.local to version control!
echo.
pause

