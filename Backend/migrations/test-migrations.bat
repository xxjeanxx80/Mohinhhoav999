@echo off
REM Quick test script to check migrations

set DB_NAME=postgres
set DB_USER=postgres

REM Try to find psql.exe
set PSQL_PATH=
if exist "C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe
if exist "C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe

where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 set PSQL_PATH=psql

if "%PSQL_PATH%"=="" (
    echo.
    echo ============================================
    echo ERROR: psql.exe not found!
    echo ============================================
    echo.
    echo Please use pgAdmin instead:
    echo 1. Open pgAdmin
    echo 2. Connect to database "postgres"
    echo 3. Right-click database → Query Tool
    echo 4. Open file: migrations\test-migrations.sql
    echo 5. Execute (F5)
    echo.
    pause
    exit /b 1
)

echo Testing migrations...
echo.
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f migrations\test-migrations.sql
echo.
pause

