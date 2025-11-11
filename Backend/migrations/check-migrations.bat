@echo off
REM Script to check migration status

set DB_NAME=postgres
set DB_USER=postgres

REM Try to find psql.exe
set PSQL_PATH=
if exist "C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-16\bin\psql.exe
if exist "C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-15\bin\psql.exe
if exist "C:\laragon\bin\postgresql\postgresql-14\bin\psql.exe" set PSQL_PATH=C:\laragon\bin\postgresql\postgresql-14\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe

where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 set PSQL_PATH=psql

if "%PSQL_PATH%"=="" (
    echo ERROR: psql.exe not found!
    echo Please run check-migrations.sql in pgAdmin instead.
    pause
    exit /b 1
)

echo Checking migration status...
echo.
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f migrations\check-migrations.sql
pause

