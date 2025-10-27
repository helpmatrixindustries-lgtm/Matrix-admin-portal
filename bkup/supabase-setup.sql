-- Matrix Industries Admin Portal - Supabase Setup
-- Run this SQL in your Supabase SQL Editor

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('certificate', 'offer_letter', 'lor')),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  internship_domain TEXT NOT NULL,
  issue_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
  pdf_url TEXT,
  qr_code_url TEXT,
  additional_fields JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for verification" ON documents;
DROP POLICY IF EXISTS "Authenticated users full access" ON documents;

-- Policy: Allow public read access for verification (anyone can verify documents)
CREATE POLICY "Public read access for verification"
  ON documents
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can update documents
CREATE POLICY "Authenticated users can update"
  ON documents
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete"
  ON documents
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;

-- Create the trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_student_email ON documents(student_email);

-- Storage Bucket Setup
-- Note: The storage bucket and policies need to be created through the Supabase Dashboard UI
-- OR run the following commands separately as they may require different permissions

-- Step 1: Create bucket (run this first, or create via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Storage policies (if the above fails with permission error, skip to manual setup below)
-- IMPORTANT: If you get "must be owner of table objects" error, 
-- you need to create these policies via the Supabase Dashboard UI instead:
-- 1. Go to Storage > Policies in your Supabase Dashboard
-- 2. Click "New Policy" for the storage.objects table
-- 3. Create the following policies manually:

-- AUTOMATED APPROACH (may fail with permission error):
DO $$ 
BEGIN
  -- Enable RLS for storage
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
  
  -- Drop existing storage policies if they exist
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated insert" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
  
  -- Allow public read access to documents bucket
  CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
  
  -- Allow authenticated insert
  CREATE POLICY "Authenticated insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
  
  -- Allow authenticated update
  CREATE POLICY "Authenticated update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
  
  -- Allow authenticated delete
  CREATE POLICY "Authenticated delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Storage policies need to be created via Dashboard UI. See manual setup instructions.';
END $$;

-- MANUAL SETUP (if automated approach fails):
-- If you get permission errors above, create policies manually via Supabase Dashboard:
-- 
-- 1. Go to: Storage > Policies
-- 2. Click "New Policy" on storage.objects
-- 3. Create these 4 policies:
--
-- Policy 1: "Public read access"
--   - Operation: SELECT
--   - Policy definition: bucket_id = 'documents'
--
-- Policy 2: "Authenticated insert"  
--   - Operation: INSERT
--   - WITH CHECK: bucket_id = 'documents' AND auth.uid() IS NOT NULL
--
-- Policy 3: "Authenticated update"
--   - Operation: UPDATE  
--   - USING: bucket_id = 'documents' AND auth.uid() IS NOT NULL
--
-- Policy 4: "Authenticated delete"
--   - Operation: DELETE
--   - USING: bucket_id = 'documents' AND auth.uid() IS NOT NULL
