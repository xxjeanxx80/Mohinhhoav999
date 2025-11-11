-- Migration: Add bank account fields to users table for payouts
-- Date: 2025-01-XX
-- Description: Add bank_name, bank_account_number, and bank_account_holder columns to users table for owner payouts

-- Add bank account fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255) NULL DEFAULT NULL;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('bank_name', 'bank_account_number', 'bank_account_holder')
ORDER BY column_name;

