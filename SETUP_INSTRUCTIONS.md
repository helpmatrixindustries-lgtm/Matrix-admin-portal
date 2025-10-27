# Matrix Industries Admin Portal - Setup Instructions

## Overview
Complete admin portal for managing Internship Certificates, Offer Letters, and Letters of Recommendation with PDF generation, QR codes, and verification.

## Features Implemented ✅
- ✅ Access code authentication (MAI@0320)
- ✅ Multi-document generation (Certificate, Offer Letter, LoR)
- ✅ Professional PDF generation with Matrix branding
- ✅ QR code generation and verification
- ✅ Bulk CSV upload for batch processing
- ✅ Document management (search, filter, revoke)
- ✅ Audit logs for compliance
- ✅ Supabase storage integration
- ✅ Public verification portal

## Supabase Setup (Required)

### Step 1: Run SQL Schema
1. Go to your Supabase project: https://supabase.com/dashboard/project/srorhhpjleehnudorsvw
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute

**IMPORTANT:** This will create:
- Documents table with proper Row Level Security (RLS) policies
- Storage bucket named 'documents' (public)
- Storage policies for authenticated users
- Indexes for better performance

### Step 2: Enable Email Authentication (Required for RLS)
1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Enable **Email** provider if not already enabled
3. Configure email settings (or disable email confirmation for testing):
   - Go to **Authentication** > **Email Templates**
   - For development: Disable "Enable email confirmations" in Settings
   
The admin account will be automatically created on first login with:
- Email: `admin@matrixindustries.in`
- Password: Generated from access code (handled automatically)

### Step 3: Verify Storage Bucket
The SQL script should create the 'documents' bucket automatically. If it doesn't:
1. Go to **Storage** in your Supabase dashboard
2. Check if bucket named `documents` exists and is **Public**
3. If not, create it manually and set it to public

## Access Credentials

**Admin Access Code:** `MAI@0320`

This is a hardcoded access code for simplified admin authentication. Enter this code on the login page to access the admin portal.

## Key Features Guide

### 1. Single Document Creation
- Navigate to **Create Document**
- Fill in student details
- Select document type (Certificate/Offer Letter/LoR)
- Add optional fields based on document type
- System automatically:
  - Generates professional PDF
  - Creates QR code
  - Uploads to Supabase storage
  - Makes verification URL

### 2. Bulk Upload
- Navigate to **Bulk Upload**
- Download CSV template
- Fill with student data
- Upload CSV file
- System processes all documents automatically

**CSV Template Columns:**
- type (certificate/offer_letter/lor)
- student_name
- student_email
- internship_domain
- issue_date (YYYY-MM-DD)
- duration (optional)
- performance (optional: Excellent/Good)
- position (optional)
- start_date (optional)
- stipend (optional)

### 3. Document Management
- View all documents in table format
- Search by name, email, or domain
- Filter by type and status
- Actions available:
  - **View**: See document details
  - **Download**: Get PDF
  - **Revoke**: Mark document as invalid

### 4. Public Verification
- Share verification URL: `/verify/{document-id}`
- Anyone can verify document authenticity
- QR codes on PDFs link to verification page
- Shows: Document type, student name, domain, issue date, status

### 5. Audit Logs
- Complete history of all operations
- Track document creation and revocation
- Search by document ID, name, or type
- Compliance-ready logging

## PDF Templates

### Certificate Template
- Matrix logo and branding
- Professional certificate layout
- Student name prominently displayed
- Internship domain and duration
- QR code for verification
- Digital signature section

### Offer Letter Template
- Formal business letter format
- Position and department details
- Start date and stipend
- Terms and conditions
- QR code and document ID

### Letter of Recommendation Template
- Professional recommendation format
- Performance-based content (Excellent/Good)
- Personalized based on domain
- Signed by Matrix Industries
- QR verification

## Branding
- **Colors:** #21808D (primary), #32B8C6 (secondary), #279756 (accent)
- **Logo:** Embedded in all PDFs
- **Professional:** Corporate styling throughout

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **UI:** Shadcn/ui + Tailwind CSS
- **PDF:** jsPDF
- **QR Codes:** qrcode library
- **Backend:** Supabase (Database + Storage)
- **Auth:** Simple access code

## Security Notes
- Access code authentication with Supabase Auth integration
- Row Level Security (RLS) enabled on database
- Authenticated users required for all write operations
- Public verification endpoint is read-only
- All admin operations require Supabase authentication
- Storage bucket has proper access policies
- Admin account automatically created on first login

## Troubleshooting

### PDFs not uploading
- Check storage bucket exists and is named `documents`
- Verify bucket is set to public
- Check storage policies are configured

### Documents not appearing
- Verify SQL schema was run successfully
- Check RLS policies are enabled
- Ensure documents table exists

### Bulk upload failing
- Validate CSV format matches template
- Check all required fields are present
- Ensure dates are in YYYY-MM-DD format

## Next Steps (Optional Enhancements)
- Email delivery system (requires Edge Function with email service)
- Template customization UI
- Advanced analytics dashboard
- Export to Excel/CSV
- Document versioning
- Multi-signature support

## Support
For issues or questions, check:
1. Supabase project logs
2. Browser console for errors
3. Network tab for failed requests
