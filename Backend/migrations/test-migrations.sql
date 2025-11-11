-- Quick test script to check if migrations were applied
-- Run this in pgAdmin Query Tool on database "postgres"

-- Test 1: Bank Account Fields (Most Important)
SELECT 
    'Bank Account Fields' AS test_name,
    CASE 
        WHEN COUNT(*) = 3 THEN 'PASSED - All 3 columns exist'
        ELSE 'FAILED - Missing columns'
    END AS result,
    COUNT(*) AS columns_found
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('bank_name', 'bank_account_number', 'bank_account_holder');

-- Show the actual columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('bank_name', 'bank_account_number', 'bank_account_holder')
ORDER BY column_name;

