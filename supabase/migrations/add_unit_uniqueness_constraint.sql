-- Add unique constraint so the same unit number can't exist twice in one property
-- Run this in Supabase SQL Editor

ALTER TABLE units 
ADD CONSTRAINT units_property_unit_unique 
UNIQUE (property_id, unit_number);

-- This prevents the duplicate-unit-3 problem from ever happening again
-- If it fails because duplicates still exist, delete the duplicates first:
-- DELETE FROM units a USING units b
-- WHERE a.id > b.id AND a.property_id = b.property_id AND a.unit_number = b.unit_number;
-- Then re-run the ALTER TABLE above.
