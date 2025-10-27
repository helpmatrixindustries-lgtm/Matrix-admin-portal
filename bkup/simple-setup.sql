-- SIMPLIFIED SUPABASE SETUP - Run this in SQL Editor
-- This only handles what CAN be done via SQL
-- Storage policies MUST be created via Dashboard UI (see QUICK_FIX.md)

-- Drop and recreate policies for documents table
DROP POLICY IF EXISTS "Public read access for verification" ON documents;
DROP POLICY IF EXISTS "Authenticated users full access" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert" ON documents;
DROP POLICY IF EXISTS "Authenticated users can update" ON documents;
DROP POLICY IF EXISTS "Authenticated users can delete" ON documents;

-- Create new policies
CREATE POLICY "Public read access for verification"
  ON documents
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update"
  ON documents
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete"
  ON documents
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create storage bucket (if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- That's it! Storage policies MUST be created via UI - see instructions above or in QUICK_FIX.md
