-- Migration: Add tag field to media table for avatar/background/gallery
-- Date: 2025-01-XX
-- Description: Add tag column to media table to differentiate avatar, background, gallery images

-- Add tag column to media table
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS tag VARCHAR(50) NULL DEFAULT NULL;

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'media' AND column_name = 'tag';

