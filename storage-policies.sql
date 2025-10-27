-- STORAGE POLICIES SQL - Try running this in Supabase SQL Editor
-- If this fails with permission errors, you MUST use the Dashboard UI instead

-- NOTE: You must create the 'documents' bucket manually via Supabase Dashboard UI first!
-- Go to: Storage > New Bucket > Name: "documents" > Public: ON

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- Policy 1: Authenticated insert
CREATE POLICY "Authenticated insert"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Policy 2: Public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents');

-- Policy 3: Authenticated update
CREATE POLICY "Authenticated update"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Policy 4: Authenticated delete
CREATE POLICY "Authenticated delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
