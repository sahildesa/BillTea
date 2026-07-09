@echo off
cd /d "%~dp0"
title BillTea Web App Launcher
cls

echo ======================================================================
echo             Welcome to the BillTea Web App Launcher
echo ======================================================================
echo.

:: 1. Check for backend environment file
if not exist "server\.env" (
    echo [!] Server environment file .env not found.
    echo [*] Creating 'server\.env' from 'server\.env.example'...
    copy "server\.env.example" "server\.env" >nul
    echo.
    echo ----------------------------------------------------------------------
    echo [WARNING] IMPORTANT CONFIGURATION REQUIRED [WARNING]
    echo ----------------------------------------------------------------------
    echo A new '.env' file has been created in the 'server' folder.
    echo Please update the DATABASE_URL with your PostgreSQL database password.
    echo.
    echo Opening 'server\.env' in Notepad for you now...
    start notepad "server\.env"
    echo.
    echo Press any key AFTER you have saved and closed the '.env' file.
    pause >nul
    echo.
)

:: 2. Check and install Server dependencies
if not exist "server\node_modules" (
    echo [*] Backend dependencies node_modules not found. Installing...
    cd server
    call npm install
    cd ..
    echo [SUCCESS] Backend packages installed successfully.
    echo.
) else (
    echo [*] Backend dependencies already installed. Skipping...
)

:: 3. Check and install Client dependencies
if not exist "client\node_modules" (
    echo [*] Frontend dependencies node_modules not found. Installing...
    cd client
    call npm install
    cd ..
    echo [SUCCESS] Frontend packages installed successfully.
    echo.
) else (
    echo [*] Frontend dependencies already installed. Skipping...
)

:: 4. Generate Prisma Client
echo [*] Generating Prisma Client...
cd server
call npm run prisma:generate
cd ..
echo [SUCCESS] Prisma Client generated.
echo.

:: 5. Auto Run Database Migrations if password is set
findstr /C:"DATABASE_URL" "server\.env" | findstr "YOUR_PASSWORD_HERE" >nul
if %errorlevel% equ 0 (
    echo ----------------------------------------------------------------------
    echo [WARNING] DATABASE NOT MIGRATED [WARNING]
    echo ----------------------------------------------------------------------
    echo You have not updated your database password in 'server\.env'.
    echo Please edit 'server\.env' and enter your PostgreSQL password,
    echo then restart this script.
    echo.
    pause
    exit /b
) else (
    echo [*] Checking database migrations...
    cd server
    call npx prisma migrate deploy
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Database migration failed with code %errorlevel%.
        echo Please resolve the migration issues and restart this script.
        cd ..
        pause
        exit /b %errorlevel%
    )
    echo [*] Ensuring default database records exist ^(seeding^)...
    call npm run prisma:seed
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Database seeding failed with code %errorlevel%.
        cd ..
        pause
        exit /b %errorlevel%
    )
    cd ..
    echo [SUCCESS] Database migrations and seeding applied.
    echo.
)

echo ======================================================================
echo Starting Backend Server and Frontend Web Client...
echo ======================================================================
echo.

:: Start NestJS Backend Server in a new window
start "BillTea Backend Server" cmd /k "title BillTea Backend Server && cd server && echo Starting NestJS backend... && npm run start:dev"

:: Start Next.js Frontend Web Client in a new window
start "BillTea Frontend Client" cmd /k "title BillTea Frontend Client && cd client && echo Starting Next.js frontend... && npm run dev"

echo [*] Waiting 5 seconds for servers to initialize...
timeout /t 5 >nul

echo [*] Opening the web browser to http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo Startup complete! Both servers are running in separate windows.
echo    - Backend API: http://localhost:5000/api/v1
echo    - Frontend Web: http://localhost:3000
echo    - Swagger Docs: http://localhost:5000/api/docs
echo.
echo Close the separate command windows to stop the servers.
echo ======================================================================
pause