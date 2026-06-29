-- Run this in Supabase SQL editor
-- Adds ownership doc + status to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS ownership_doc_url text,
  ADD COLUMN IF NOT EXISTS ownership_status text DEFAULT 'none';
  -- ownership_status: 'none' | 'under_review' | 'verified' | 'rejected'

-- Adds national ID doc + status to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS id_doc_url text,
  ADD COLUMN IF NOT EXISTS id_status text DEFAULT 'none';
  -- id_status: 'none' | 'under_review' | 'verified' | 'rejected'
