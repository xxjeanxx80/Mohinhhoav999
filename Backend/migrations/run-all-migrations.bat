@echo off
REM Script to run all migrations in order (Windows)
REM This script will try to find psql in common PostgreSQL installation paths

set DB_NAME=postgres
set DB_USER=postgres

REM Try to find psql.exe in common PostgreSQL installation paths
set PSQL_PATH=
REM Laragon PostgreSQL (Priority - User's installation)
if exist "C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe
if exist "C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe
if exist "C:\laragon\bin\postgresql\postgresql-14\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-14\bin\psql.exe
if exist "C:\laragon\data\postgresql-16\bin\psql.exe" set PSQL_PATH=C:\laragon\data\postgresql-16\bin\psql.exe
if exist "C:\laragon\data\postgresql-15\bin\psql.exe" set PSQL_PATH=C:\laragon\data\postgresql-15\bin\psql.exe
if exist "C:\laragon\data\postgresql-14\bin\psql.exe" set PSQL_PATH=C:\laragon\data\postgresql-14\bin\psql.exe
REM Standard PostgreSQL installations
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe
if exist "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe

REM If psql is in PATH, use it directly
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PSQL_PATH=psql
)

if "%PSQL_PATH%"=="" (
    echo ERROR: psql.exe not found!
    echo.
    echo Please do one of the following:
    echo 1. Add PostgreSQL bin folder to PATH, OR
    echo 2. Edit this script and set PSQL_PATH to your psql.exe location, OR
    echo 3. Use pgAdmin to run migrations manually (see README.md)
    echo.
    echo Common PostgreSQL paths:
    echo   C:\Program Files\PostgreSQL\16\bin\psql.exe
    echo   C:\Program Files\PostgreSQL\15\bin\psql.exe
    echo   C:\Program Files\PostgreSQL\14\bin\psql.exe
    echo.
    pause
    exit /b 1
)

echo Found psql at: %PSQL_PATH%
echo Running all migrations...
echo.

REM Migration 1: Add avatar fields
echo [1/3] Running add-avatar-fields.sql...
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f migrations\add-avatar-fields.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 1 failed!
    pause
    exit /b 1
)

REM Migration 2: Add spa location index
echo [2/3] Running add-spa-location-index.sql...
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f migrations\add-spa-location-index.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 2 failed!
    pause
    exit /b 1
)

REM Migration 3: Add bank account fields
echo [3/3] Running add-bank-account-fields.sql...
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f migrations\add-bank-account-fields.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 3 failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo All migrations completed successfully!
echo ========================================
pause

