-- Migration: Add index for spa location queries (latitude, longitude)
-- Purpose: Improve performance of nearby search queries
-- Date: 2025-01-XX

-- Index for latitude and longitude columns to speed up geolocation queries
CREATE INDEX IF NOT EXISTS idx_spas_location 
ON spas (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_approved = true;

-- Alternative: Composite index (uncomment if needed)
-- CREATE INDEX IF NOT EXISTS idx_spas_location_approved 
-- ON spas (is_approved, latitude, longitude)
-- WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Verify index was created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'spas' AND indexname LIKE '%location%';

