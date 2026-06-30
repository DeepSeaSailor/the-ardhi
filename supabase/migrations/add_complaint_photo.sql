-- Add photo support to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photo_url text;

-- MUST RUN IN SUPABASE SQL EDITOR
