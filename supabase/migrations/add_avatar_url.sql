-- Add profile picture support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- MUST RUN IN SUPABASE SQL EDITOR
