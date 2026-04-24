-- Fix Supabase Storage RLS policies for issue-attachments bucket
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Drop existing policies if they exist (this won't error if they don't exist)
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Disable RLS temporarily to allow uploads
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies
-- 1. Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'issue-attachments'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- 2. Allow authenticated users to read all files
CREATE POLICY "Allow authenticated users to read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'issue-attachments'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- 3. Allow service role (backend) full access
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'issue-attachments'
  AND auth.role() = 'service_role'
)
WITH CHECK (
  bucket_id = 'issue-attachments'
  AND auth.role() = 'service_role'
);

-- 4. Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'issue-attachments'
  AND (owner = auth.uid() OR auth.role() = 'service_role')
);

-- Verify policies were created
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
