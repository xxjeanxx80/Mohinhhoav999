-- Script to check if all migrations have been applied
-- Run this in pgAdmin Query Tool or psql

-- ============================================
-- 1. Check Avatar Fields Migration
-- ============================================
SELECT 
    'Avatar Fields Migration' AS migration_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'media' AND column_name = 'tag'
        ) THEN 'PASSED' 
        ELSE 'FAILED - tag column not found in media table'
    END AS status;

-- ============================================
-- 2. Check Spa Location Index Migration
-- ============================================
SELECT 
    'Spa Location Index Migration' AS migration_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'spas' AND indexname LIKE '%location%'
        ) THEN 'PASSED' 
        ELSE 'FAILED - location index not found in spas table'
    END AS status;

-- ============================================
-- 3. Check Bank Account Fields Migration
-- ============================================
SELECT 
    'Bank Account Fields Migration' AS migration_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'bank_name'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'bank_account_number'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'bank_account_holder'
        ) THEN 'PASSED' 
        ELSE 'FAILED - bank account columns not found in users table'
    END AS status;

-- ============================================
-- 4. Detailed Check: Bank Account Fields
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('bank_name', 'bank_account_number', 'bank_account_holder')
ORDER BY column_name;

-- ============================================
-- 5. Summary Report
-- ============================================
SELECT 
    '=== MIGRATION STATUS SUMMARY ===' AS report;

SELECT 
    'Avatar Fields' AS migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'tag'
    ) THEN 'Applied' ELSE 'Not Applied' END AS status
UNION ALL
SELECT 
    'Spa Location Index' AS migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'spas' AND indexname LIKE '%location%'
    ) THEN 'Applied' ELSE 'Not Applied' END AS status
UNION ALL
SELECT 
    'Bank Account Fields' AS migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'bank_name'
    ) THEN 'Applied' ELSE 'Not Applied' END AS status;

