@echo off
REM Frontend Setup Script for Windows

echo.
echo Credential Verification System - Frontend Setup
echo.

REM Check if ethers library exists
if not exist "libs\ethers.umd.min.js" (
    echo Error: libs\ethers.umd.min.js not found
    echo Please ensure the ethers UMD library is present in the project root
    pause
    exit /b 1
)

REM Create directories if they don't exist
if not exist "frontend\shared\libs" (
    mkdir frontend\shared\libs
)

REM Copy ethers library
echo Copying ethers library...
copy "libs\ethers.umd.min.js" "frontend\shared\libs\" /Y
echo Done!

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Start Hardhat node:
echo    cd backend
echo    npm install
echo    npm run node
echo.
echo 2. In another terminal, deploy contracts:
echo    npm run deploy-local
echo.
echo 3. In another terminal, start a web server:
echo    python -m http.server 5500
echo    or use: npx http-server -p 5500
echo.
echo 4. Access dashboards:
echo    - Admin: http://localhost:5500/frontend/admin/
echo    - Institution: http://localhost:5500/frontend/institution/
echo    - Student: http://localhost:5500/frontend/student/
echo    - Employer: http://localhost:5500/frontend/employer/
echo.
pause
