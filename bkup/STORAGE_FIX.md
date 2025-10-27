# 🚨 URGENT FIX - Storage RLS Error

## Error You're Seeing:
```
StorageApiError: new row violates row-level security policy
```

## Why This Happens:
The storage bucket has Row Level Security enabled, but no policies exist to allow authenticated users to upload files.

## ✅ SOLUTION (5 Minutes)

### Part A: Supabase Dashboard (REQUIRED)

#### 1. Open Storage Policies
- Go to: https://supabase.com/dashboard/project/srorhhpjleehnudorsvw/storage/policies
- You should see a section for `storage.objects`

#### 2. Create Policy for INSERT (Upload)
Click **"New Policy"** button, then:

```
┌─────────────────────────────────────────┐
│ Policy Name: Authenticated insert       │
│ Operation:   ☑ INSERT                   │
│ Target Role: authenticated              │
│ WITH CHECK:  bucket_id = 'documents'    │
└─────────────────────────────────────────┘
```

Click **"Review"** → **"Save policy"**

#### 3. Create Policy for SELECT (Read)
Click **"New Policy"** again:

```
┌─────────────────────────────────────────┐
│ Policy Name: Public read access         │
│ Operation:   ☑ SELECT                   │
│ Target Role: public                     │
│ USING:       bucket_id = 'documents'    │
└─────────────────────────────────────────┘
```

Click **"Review"** → **"Save policy"**

#### 4. Create Policy for UPDATE
Click **"New Policy"** again:

```
┌─────────────────────────────────────────┐
│ Policy Name: Authenticated update       │
│ Operation:   ☑ UPDATE                   │
│ Target Role: authenticated              │
│ USING:       bucket_id = 'documents'    │
└─────────────────────────────────────────┘
```

Click **"Review"** → **"Save policy"**

#### 5. Create Policy for DELETE
Click **"New Policy"** again:

```
┌─────────────────────────────────────────┐
│ Policy Name: Authenticated delete       │
│ Operation:   ☑ DELETE                   │
│ Target Role: authenticated              │
│ USING:       bucket_id = 'documents'    │
└─────────────────────────────────────────┘
```

Click **"Review"** → **"Save policy"**

### Part B: Verify Your Setup

#### Check 1: Storage Bucket Exists
- Go to: Storage → Buckets
- Look for: `documents` bucket
- Status: Should be **Public** ✅
- If missing: Click "New bucket" → Name: `documents` → Toggle "Public" ON

#### Check 2: Verify Policies
You should see **4 policies** on `storage.objects`:
1. ✅ Public read access (SELECT)
2. ✅ Authenticated insert (INSERT)
3. ✅ Authenticated update (UPDATE)
4. ✅ Authenticated delete (DELETE)

### Part C: Test

1. **Refresh your browser** (Ctrl+F5)
2. **Login** with access code: `MAI@0320`
3. **Go to Create Document**
4. **Fill in the form** and submit
5. **Should work now!** 🎉

---

## 🔍 Troubleshooting

### Still getting 400 error?

**Check authentication:**
```javascript
// Open browser console (F12) and run:
supabase.auth.getSession().then(console.log)
// Should show: { session: { user: {...} } }
```

**Check storage bucket:**
- Dashboard → Storage → Buckets
- `documents` should be listed and PUBLIC

**Check policies exist:**
- Dashboard → Storage → Policies
- Should see 4 policies for `storage.objects`

### Different error?

**"Bucket not found"**
- Create the `documents` bucket via Storage UI
- Make sure it's set to PUBLIC

**"Not authenticated"**
- Logout and login again with `MAI@0320`
- Check browser console for auth session

**"Invalid bucket"**
- Bucket name must be exactly: `documents` (lowercase)

---

## 📝 Quick Commands (if needed)

**Check if bucket exists (SQL Editor):**
```sql
SELECT * FROM storage.buckets WHERE id = 'documents';
```

**Check storage policies (SQL Editor):**
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

**Check current auth user (SQL Editor):**
```sql
SELECT auth.uid(), auth.email();
```

---

## ✨ After Setup

Once policies are created, your app will be able to:
- ✅ Upload PDFs to storage
- ✅ Upload QR codes to storage
- ✅ Download files via public URLs
- ✅ Update/delete files as needed

All storage operations will respect RLS, allowing:
- **Authenticated users**: Full CRUD access
- **Public users**: Read-only access (for verification)

---

## 🎯 Summary

**The SQL script cannot create storage policies** due to Supabase permissions.

**You MUST create them via Dashboard UI** - it takes 2 minutes!

Follow Part A above, then test. That's it! 🚀
