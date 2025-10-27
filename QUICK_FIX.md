# Quick Fix for Row Level Security Error

## Problem
You're getting "new row violates row level security" error when creating documents because the app now uses proper Supabase authentication, but your database policies need to be updated.

## Solution - Follow These Steps IN ORDER:

### Step 1: Update Database Policies (SQL Editor)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/srorhhpjleehnudorsvw
2. Click **SQL Editor** in the left sidebar
3. Copy and paste this EXACT code:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Public read access for verification" ON documents;
DROP POLICY IF EXISTS "Authenticated users full access" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert" ON documents;
DROP POLICY IF EXISTS "Authenticated users can update" ON documents;
DROP POLICY IF EXISTS "Authenticated users can delete" ON documents;

-- Create new policies that work with auth.uid()
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
```

4. Click **Run** button

### Step 2: Enable Email Authentication
1. Go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication** > **URL Configuration**
4. Set Site URL to: `http://localhost:5173` (for local dev) or your production URL
5. Go to **Authentication** > **Email Templates** 
6. **IMPORTANT for testing**: Scroll to bottom and toggle OFF "Enable email confirmations"
   - This allows instant login without email verification
   - You can re-enable this later for production

### Step 3: Setup Storage Bucket & Policies (Dashboard UI)

#### Create Bucket:
1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Name: `documents`
4. Toggle **Public bucket** ON
5. Click **Create bucket**

#### Add Storage Policies:
1. Go to **Storage** > **Policies** (or click "Policies" tab in Storage)
2. You'll see "storage.objects" - click **New Policy**

**Create 4 policies:**

**Policy 1 - Public Read:**
- Click "New Policy" > "For full customization"
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression:
  ```sql
  bucket_id = 'documents'
  ```
- Click "Review" then "Save policy"

**Policy 2 - Authenticated Insert:**
- Click "New Policy" > "For full customization"
- Policy name: `Authenticated insert`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```
- Click "Review" then "Save policy"

**Policy 3 - Authenticated Update:**
- Click "New Policy" > "For full customization"
- Policy name: `Authenticated update`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```
- Click "Review" then "Save policy"

**Policy 4 - Authenticated Delete:**
- Click "New Policy" > "For full customization"
- Policy name: `Authenticated delete`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```
- Click "Review" then "Save policy"

### Step 4: Test the Application
1. Clear your browser's localStorage (F12 > Application > Local Storage > Clear)
2. Refresh the app
3. You should be redirected to login
4. Enter access code: `MAI@0320`
5. First login will auto-create admin account
6. Try creating a document - should work now!

## What Changed?

### Before (Broken):
- App used localStorage for "fake" auth
- Database required actual Supabase authentication
- **Mismatch = RLS error**

### After (Fixed):
- App now uses real Supabase authentication
- Admin account created automatically on first login
- Database accepts authenticated requests
- **Everything works!**

## Troubleshooting

### "Email not confirmed" error:
- Make sure you disabled "Enable email confirmations" in Authentication settings

### Still getting RLS error:
- Verify all 4 document policies exist in SQL Editor
- Check that auth.uid() returns a value by running: `SELECT auth.uid();` in SQL Editor while logged in
- Clear browser cache and localStorage

### Storage upload fails:
- Verify 'documents' bucket exists and is PUBLIC
- Check all 4 storage policies are created
- Try uploading a test file manually in Storage UI

### Can't login:
- Check email provider is enabled in Authentication > Providers
- Clear localStorage and try again
- Check browser console for errors (F12)

## Need More Help?

Check the browser console (F12) for specific error messages and share them for more targeted help.
