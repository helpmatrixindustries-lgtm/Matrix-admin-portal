# Matrix Industries Website - Certificate Verification Integration Guide

## Overview
This guide provides complete instructions for integrating certificate verification functionality into the official Matrix Industries website. The verification system will connect to the existing Supabase database used by the Matrix Docs Forge application.

---

## Prerequisites

### 1. Supabase Configuration
You already have a Supabase project with:
- **Documents Table**: `documents` with verification codes
- **Database URL**: Your Supabase project URL
- **Anon Key**: Public API key for client-side queries

### 2. Required Information
Collect from your current Supabase project:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Note on Verification Codes**: 
The current system uses the document UUID as the verification code. The QR codes point to URLs like:
`https://matrixindustries.in/verify?code=550e8400-e29b-41d4-a716-446655440000`

For human-friendly codes (e.g., MAI-ABC123), you would need to add a `verification_code` column to the database. For now, the UUID-based system works perfectly for QR code scanning.

---

## Database Schema Reference

The verification page will query the `documents` table:

```sql
-- Table structure (already exists in your Supabase)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,                    -- 'certificate', 'offer_letter', 'lor'
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  issue_date DATE NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Certificate specific fields
  domain TEXT,
  duration TEXT,
  start_date DATE,
  end_date DATE,
  
  -- Offer Letter specific fields
  position TEXT,
  joining_date DATE,
  salary NUMERIC,
  location TEXT,
  
  -- Letter of Recommendation specific fields
  recommendation_text TEXT,
  recommender_name TEXT,
  recommender_designation TEXT
);
```

---

## Implementation Guide

### Step 1: Install Supabase Client

Add the Supabase JavaScript client to your Matrix Industries website:

```bash
# If using npm
npm install @supabase/supabase-js

# If using yarn
yarn add @supabase/supabase-js

# If using pnpm
pnpm add @supabase/supabase-js

# If using CDN (for vanilla HTML/JS sites)
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Step 2: Initialize Supabase Client

Create a configuration file (e.g., `supabase-config.js`):

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**For vanilla HTML/JS websites:**
```html
<script>
  const { createClient } = supabase;
  const supabaseUrl = 'YOUR_SUPABASE_URL';
  const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
</script>
```

### Step 3: Create Verification Page HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Certificate - Matrix Industries</title>
  <style>
    /* Add your Matrix Industries branding styles here */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 1rem;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .verification-input {
      margin-bottom: 30px;
    }
    
    .verification-input label {
      display: block;
      font-weight: 600;
      margin-bottom: 10px;
      color: #333;
    }
    
    .verification-input input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .verification-input input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    
    .button-group {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .btn {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    
    .result {
      display: none;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .result.success {
      background: #d1fae5;
      border: 2px solid #10b981;
    }
    
    .result.error {
      background: #fee2e2;
      border: 2px solid #ef4444;
    }
    
    .result h3 {
      margin-bottom: 15px;
      font-size: 1.2rem;
    }
    
    .result-details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    
    .detail-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #6b7280;
      width: 180px;
    }
    
    .detail-value {
      color: #111827;
      flex: 1;
    }
    
    .qr-scanner {
      display: none;
      margin-top: 20px;
      text-align: center;
    }
    
    #qr-reader {
      max-width: 500px;
      margin: 0 auto;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .spinner {
      display: none;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Certificate Verification</h1>
      <p>Verify the authenticity of Matrix Industries certificates</p>
    </div>
    
    <div class="content">
      <!-- Manual Verification Input -->
      <div class="verification-input">
        <label for="verification-code">Enter Verification Code</label>
        <input 
          type="text" 
          id="verification-code" 
          placeholder="e.g., MAI-ABC123XYZ"
          autocomplete="off"
        />
      </div>
      
      <!-- Action Buttons -->
      <div class="button-group">
        <button class="btn btn-primary" onclick="verifyDocument()">
          Verify Certificate
        </button>
        <button class="btn btn-secondary" onclick="toggleQRScanner()">
          📷 Scan QR Code
        </button>
      </div>
      
      <!-- QR Code Scanner -->
      <div class="qr-scanner" id="qr-scanner">
        <div id="qr-reader"></div>
        <button class="btn btn-secondary" onclick="stopQRScanner()" style="margin-top: 15px;">
          Stop Scanner
        </button>
      </div>
      
      <!-- Loading Spinner -->
      <div class="spinner" id="loading-spinner"></div>
      
      <!-- Results -->
      <div id="result" class="result"></div>
    </div>
  </div>

  <!-- Supabase Client -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <!-- QR Code Scanner Library -->
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  
  <!-- Verification Script -->
  <script src="verification.js"></script>
</body>
</html>
```

### Step 4: Create Verification JavaScript (`verification.js`)

```javascript
// Initialize Supabase
const { createClient } = supabase;
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

let html5QrcodeScanner = null;

// Main verification function
async function verifyDocument() {
  const verificationCode = document.getElementById('verification-code').value.trim();
  const resultDiv = document.getElementById('result');
  const spinner = document.getElementById('loading-spinner');
  
  // Validate input
  if (!verificationCode) {
    showError('Please enter a verification code');
    return;
  }
  
  // Show loading
  resultDiv.style.display = 'none';
  spinner.style.display = 'block';
  
  try {
    // Query Supabase for the document
    // The verification code is the document ID (UUID)
    const { data, error } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', verificationCode)
      .single();
    
    spinner.style.display = 'none';
    
    if (error || !data) {
      showError('Invalid verification code. No document found.');
      return;
    }
    
    // Show success with document details
    showSuccess(data);
    
  } catch (err) {
    spinner.style.display = 'none';
    showError('An error occurred while verifying. Please try again.');
    console.error('Verification error:', err);
  }
}

// Display success result
function showSuccess(document) {
  const resultDiv = document.getElementById('result');
  
  // Format document type
  const typeMap = {
    'certificate': 'Internship Certificate',
    'offer_letter': 'Offer Letter',
    'lor': 'Letter of Recommendation'
  };
  const documentType = typeMap[document.type] || document.type;
  
  // Format date
  const issueDate = new Date(document.issue_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Build details HTML based on document type
  let detailsHTML = `
    <div class="detail-row">
      <div class="detail-label">Document Type:</div>
      <div class="detail-value">${documentType}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Recipient Name:</div>
      <div class="detail-value">${document.recipient_name}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Email:</div>
      <div class="detail-value">${document.recipient_email}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Issue Date:</div>
      <div class="detail-value">${issueDate}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Verification Code:</div>
      <div class="detail-value"><strong>${document.id}</strong></div>
    </div>
  `;
  
  // Add type-specific details
  if (document.type === 'certificate') {
    detailsHTML += `
      <div class="detail-row">
        <div class="detail-label">Domain:</div>
        <div class="detail-value">${document.domain || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Duration:</div>
        <div class="detail-value">${document.duration || 'N/A'}</div>
      </div>
      ${document.start_date ? `
        <div class="detail-row">
          <div class="detail-label">Period:</div>
          <div class="detail-value">${formatDate(document.start_date)} to ${formatDate(document.end_date)}</div>
        </div>
      ` : ''}
    `;
  } else if (document.type === 'offer_letter') {
    detailsHTML += `
      <div class="detail-row">
        <div class="detail-label">Position:</div>
        <div class="detail-value">${document.position || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Joining Date:</div>
        <div class="detail-value">${document.joining_date ? formatDate(document.joining_date) : 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Location:</div>
        <div class="detail-value">${document.location || 'N/A'}</div>
      </div>
      ${document.salary ? `
        <div class="detail-row">
          <div class="detail-label">Salary:</div>
          <div class="detail-value">₹${document.salary.toLocaleString('en-IN')}</div>
        </div>
      ` : ''}
    `;
  } else if (document.type === 'lor') {
    detailsHTML += `
      <div class="detail-row">
        <div class="detail-label">Recommender:</div>
        <div class="detail-value">${document.recommender_name || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Designation:</div>
        <div class="detail-value">${document.recommender_designation || 'N/A'}</div>
      </div>
    `;
  }
  
  resultDiv.className = 'result success';
  resultDiv.innerHTML = `
    <h3>✅ Document Verified Successfully</h3>
    <p>This is an authentic document issued by Matrix Industries.</p>
    <div class="result-details">
      ${detailsHTML}
    </div>
  `;
  resultDiv.style.display = 'block';
}

// Display error result
function showError(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.className = 'result error';
  resultDiv.innerHTML = `
    <h3>❌ Verification Failed</h3>
    <p>${message}</p>
  `;
  resultDiv.style.display = 'block';
}

// Format date helper
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Toggle QR Code Scanner
function toggleQRScanner() {
  const qrScannerDiv = document.getElementById('qr-scanner');
  
  if (qrScannerDiv.style.display === 'none' || !qrScannerDiv.style.display) {
    qrScannerDiv.style.display = 'block';
    startQRScanner();
  } else {
    stopQRScanner();
  }
}

// Start QR Code Scanner
function startQRScanner() {
  html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader",
    { 
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    },
    false
  );
  
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

// QR Code scan success callback
function onScanSuccess(decodedText, decodedResult) {
  // Extract verification code from URL
  // Expected format: https://matrixindustries.in/verify?code=550e8400-e29b-41d4-a716-446655440000
  let verificationCode = decodedText;
  
  if (decodedText.includes('?code=')) {
    verificationCode = decodedText.split('?code=')[1];
  } else if (decodedText.includes('/verify/')) {
    verificationCode = decodedText.split('/verify/')[1];
  }
  
  // Set the verification code in input field
  document.getElementById('verification-code').value = verificationCode;
  
  // Stop scanner and verify
  stopQRScanner();
  verifyDocument();
}

// QR Code scan failure callback
function onScanFailure(error) {
  // Handle scan failure silently (continuous scanning)
}

// Stop QR Code Scanner
function stopQRScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
    html5QrcodeScanner = null;
  }
  document.getElementById('qr-scanner').style.display = 'none';
}

// Allow Enter key to trigger verification
document.getElementById('verification-code').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    verifyDocument();
  }
});
```

---

## Step 5: Update Row Level Security (RLS) Policies

Ensure your Supabase `documents` table allows public SELECT queries for verification:

```sql
-- Allow public read access to documents for verification
-- (This should already exist from your setup)
CREATE POLICY "Allow public read access"
ON documents
FOR SELECT
TO public
USING (true);
```

This policy is already in your database, so **no changes needed**.

---

## Step 6: Configure CORS (If Needed)

If your Matrix Industries website is on a different domain than your Supabase project, you may need to configure CORS:

1. Go to Supabase Dashboard → Settings → API
2. Under "API Settings", add your Matrix Industries domain to allowed origins
3. Example: `https://matrixindustries.in`

---

## Step 7: Testing the Integration

### Test Cases:

1. **Valid Certificate**
   - Enter a real verification code from your database
   - Expected: Shows success message with all details

2. **Invalid Code**
   - Enter: `INVALID-CODE`
   - Expected: Shows error message

3. **QR Code Scanning**
   - Generate a QR code pointing to: `https://your-domain.com/verify?code=MAI-ABC123XYZ`
   - Scan with phone camera or QR scanner
   - Expected: Automatically fills code and verifies

---

## Advanced Features (Optional)

### Feature 1: Download PDF Button

Add ability to download the original PDF:

```javascript
// In showSuccess function, add download button
detailsHTML += `
  <div class="detail-row">
    <div class="detail-label">Document:</div>
    <div class="detail-value">
      <button class="btn btn-primary" onclick="downloadPDF('${document.file_path}')">
        📄 Download PDF
      </button>
    </div>
  </div>
`;

// Download function
async function downloadPDF(filePath) {
  const { data, error } = await supabaseClient
    .storage
    .from('documents')
    .download(filePath);
  
  if (error) {
    alert('Error downloading PDF');
    return;
  }
  
  // Create download link
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filePath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

### Feature 2: Email Verification

Add email field to cross-verify:

```javascript
// Add email input in HTML
<div class="verification-input">
  <label for="recipient-email">Recipient Email (Optional)</label>
  <input type="email" id="recipient-email" placeholder="john@example.com" />
</div>

// Update verification query
const email = document.getElementById('recipient-email').value.trim();
let query = supabaseClient
  .from('documents')
  .select('*')
  .eq('verification_code', verificationCode);

if (email) {
  query = query.eq('recipient_email', email);
}

const { data, error } = await query.single();
```

### Feature 3: Analytics Tracking

Track verification attempts:

```javascript
async function logVerification(verificationCode, success) {
  await supabaseClient
    .from('verification_logs')
    .insert({
      verification_code: verificationCode,
      success: success,
      ip_address: await fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => d.ip),
      timestamp: new Date().toISOString()
    });
}
```

---

## Security Best Practices

### ✅ DO:
- Use environment variables for Supabase credentials
- Enable RLS policies on all tables
- Use HTTPS only for the verification page
- Rate-limit verification API calls
- Log verification attempts for audit trails

### ❌ DON'T:
- Expose service role keys in client-side code
- Allow unrestricted database access
- Store sensitive data in QR codes
- Disable HTTPS/SSL

---

## Deployment Checklist

- [ ] Replace `YOUR_SUPABASE_URL` with actual URL
- [ ] Replace `YOUR_SUPABASE_ANON_KEY` with actual key
- [ ] Test on staging environment
- [ ] Verify CORS settings
- [ ] Test QR code scanning on mobile devices
- [ ] Check responsive design on all screen sizes
- [ ] Add proper SEO meta tags
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure custom domain (e.g., `verify.matrixindustries.in`)
- [ ] Add Google Analytics or tracking
- [ ] Test with real verification codes
- [ ] Create 404 page for invalid URLs

---

## Integration URLs

Recommended URL structure:

1. **Verification Page**: `https://matrixindustries.in/verify` (or `https://verify.matrixindustries.in`)
2. **Direct Verification**: `https://matrixindustries.in/verify?code=MAI-ABC123XYZ`
3. **QR Code URL**: `https://matrixindustries.in/verify?code=MAI-ABC123XYZ`

### IMPORTANT: Update QR Code Generation in Docs Forge Portal

Your document generation portal (`pdfGenerator.ts`) must be updated to generate QR codes that point to the Matrix Industries website, NOT the internal portal.

**Current QR Code URL (WRONG):**
```javascript
const qrCodeUrl = `${window.location.origin}/verify/${data.id}`;
// This points to your internal portal, not the public website!
```

**Correct QR Code URL (RIGHT):**
```javascript
const qrCodeUrl = `https://matrixindustries.in/verify?code=${document.id}`;
// This points to the public Matrix Industries website verification page
// Using document ID as verification code
```

**What needs to change:**
1. The QR code should use the **document ID** (UUID) as the verification code
2. The URL should point to **matrixindustries.in**, not the internal portal
3. Use query parameter `?code=` for easy parsing

See the "Portal Integration" section below for exact code changes needed.

---

## Portal Integration: Update QR Code Generation

### ⚠️ CRITICAL STEP: Update Your Document Portal

Your Docs Forge portal currently generates QR codes pointing to itself. This must be changed to point to the Matrix Industries website verification page.

### Required Changes in `src/lib/pdfGenerator.ts`

Find and update these lines in ALL three PDF generation functions:

#### 1. Certificate PDF Generation (around line 147-148)

**BEFORE:**
```javascript
const qrCodeUrl = `${window.location.origin}/verify/${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 300, margin: 1 });
```

**AFTER:**
```javascript
// Use document ID and point to Matrix Industries website
const qrCodeUrl = `https://matrixindustries.in/verify?code=${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 300, margin: 1 });
```

#### 2. Offer Letter PDF Generation (around line 393-394)

**BEFORE:**
```javascript
const qrCodeUrl = `${window.location.origin}/verify/${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 250, margin: 1 });
```

**AFTER:**
```javascript
// Use document ID and point to Matrix Industries website
const qrCodeUrl = `https://matrixindustries.in/verify?code=${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 250, margin: 1 });
```

#### 3. Letter of Recommendation PDF Generation (around line 473-474)

**BEFORE:**
```javascript
const qrCodeUrl = `${window.location.origin}/verify/${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 150, margin: 1 });
```

**AFTER:**
```javascript
// Use document ID and point to Matrix Industries website
const qrCodeUrl = `https://matrixindustries.in/verify?code=${data.id}`;
const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 150, margin: 1 });
```

### Update DocumentData Interface

Ensure the `DocumentData` interface includes `verification_code`:

```typescript
export interface DocumentData {
  id: string;
  type: 'certificate' | 'offer_letter' | 'lor';
  student_name: string;
  student_email: string;
  verification_code: string;  // ADD THIS LINE
  internship_domain: string;
  issue_date: string;
  additional_fields?: {
    duration?: string;
    performance?: string;
    position?: string;
    start_date?: string;
    stipend?: string;
  };
}
```

### Pass Verification Code When Creating PDFs

In `CreateDocument.tsx` and `BulkUpload.tsx`, ensure you pass the verification code:

```typescript
const pdfBlob = await generateCertificatePDF({
  id: verificationCode,
  type: formData.type,
  student_name: formData.recipientName,
  student_email: formData.recipientEmail,
  verification_code: verificationCode,  // This is the document ID (UUID)
  // ... other fields
}, logoDataUrl);
```

### Testing the Integration

After making these changes:

1. Generate a new certificate/document
2. Open the PDF and scan the QR code
3. Verify it points to: `https://matrixindustries.in/verify?code=MAI-XXXXX`
4. The Matrix Industries website verification page should load and verify the document

---

## Framework-Specific Implementations

### React/Next.js Implementation

```jsx
// components/VerifyDocument.jsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VerifyDocument() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyDocument = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('verification_code', code)
      .single();

    setLoading(false);
    setResult(error ? { error: 'Invalid code' } : { data });
  };

  return (
    <div className="verify-container">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter verification code"
      />
      <button onClick={verifyDocument} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      {result && (
        <div className={result.error ? 'error' : 'success'}>
          {result.error || <pre>{JSON.stringify(result.data, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
```

### WordPress Integration

```php
// Add to theme's functions.php or custom plugin

add_shortcode('verify_certificate', 'matrix_verify_certificate_shortcode');

function matrix_verify_certificate_shortcode() {
    wp_enqueue_script('supabase-js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', [], null, true);
    wp_enqueue_script('verification-script', get_template_directory_uri() . '/js/verification.js', ['supabase-js'], null, true);
    
    return '
    <div id="verification-widget">
      <input type="text" id="verification-code" placeholder="Enter code" />
      <button onclick="verifyDocument()">Verify</button>
      <div id="result"></div>
    </div>
    ';
}
```

---

## Support & Maintenance

### Common Issues:

1. **CORS Error**: Add your domain to Supabase allowed origins
2. **Invalid API Key**: Ensure anon key is correct (not service role key)
3. **No Results**: Check RLS policies allow public SELECT
4. **QR Scanner Not Working**: Ensure HTTPS and camera permissions

### Contact:
For technical support with this integration, contact your development team or refer to:
- Supabase Docs: https://supabase.com/docs
- HTML5 QR Code Scanner: https://github.com/mebjas/html5-qrcode

---

## Summary

This integration creates a complete verification ecosystem:

### 🔄 The Complete Flow:

1. **Document Creation** (Docs Forge Portal)
   - Admin creates certificate/offer letter/LoR
   - System generates unique document ID (UUID)
   - QR code is generated pointing to: `https://matrixindustries.in/verify?code=<UUID>`
   - PDF is generated with embedded QR code
   - Document stored in Supabase database

2. **QR Code Scanning** (Anyone)
   - Recipient/employer scans QR code on certificate
   - Camera app opens URL: `https://matrixindustries.in/verify?code=<UUID>`
   - Lands on Matrix Industries official website verification page

3. **Verification** (Matrix Industries Website)
   - Website queries Supabase database using document ID
   - Retrieves document details from same database used by portal
   - Displays authentic document information
   - Shows success/failure based on validation

4. **Security** (Throughout)
   - Row Level Security ensures data integrity
   - Public read access allows verification without login
   - Unique verification codes prevent forgery
   - All traffic over HTTPS

### ✅ Benefits:

- **Seamless Integration**: Portal and website use same database
- **User-Friendly**: Scan QR code or enter code manually
- **Professional**: Verification happens on official Matrix Industries domain
- **Secure**: RLS policies protect data integrity
- **Scalable**: No manual verification needed
- **Trustworthy**: Verification on official company website builds trust

### 📋 What You Need to Do:

1. ✅ **Portal Updates** (DONE in this session):
   - Updated `pdfGenerator.ts` to use configurable verification URL
   - Added `verification_code` to DocumentData interface
   - Updated CreateDocument.tsx and BulkUpload.tsx to pass verification code
   - **NEW: Added Settings page** where you can change the verification URL anytime!

2. 🔨 **Website Implementation** (Next Step):
   - Create verification page at your configured URL (default: `https://matrixindustries.in/verify`)
   - Copy HTML/CSS/JS code from Step 3 & 4 in this guide
   - Replace Supabase credentials with your actual values
   - Deploy to production

3. ⚙️ **Configuration**:
   - **Go to Settings page in the portal** to set your verification URL
   - Add Matrix Industries domain to Supabase CORS settings
   - Ensure RLS policies allow public SELECT on documents table
   - Test with real verification codes

## How to Change Verification URL:

1. Login to your Matrix Docs Forge portal
2. Navigate to **Settings** (in the navbar or dashboard)
3. Enter your new verification URL (e.g., `https://yourcompany.com/verify`)
4. Click **Save Settings**
5. All new documents will use the updated URL in their QR codes

**Note**: Existing documents will keep their original QR codes. Only newly generated documents will use the new URL.

Deploy the verification page at `https://matrixindustries.in/verify` and all QR codes generated by your portal will automatically work with it!
