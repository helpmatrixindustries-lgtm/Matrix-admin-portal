# Settings Feature - Configurable Verification URL

## Overview
The Settings page allows you to dynamically configure the verification URL that will be embedded in QR codes on all generated documents. This gives you flexibility to change where certificates are verified without modifying code.

## Features

### ⚙️ Verification URL Configuration
- Set custom verification base URL
- Defaults to: `https://matrixindustries.in/verify`
- Can be changed to any valid HTTPS URL
- Examples:
  - `https://verify.matrixindustries.in`
  - `https://yourcompany.com/certificates/verify`
  - `https://verify.yourcompany.com`

### 💾 Persistent Storage
- Settings saved to browser LocalStorage
- Persists across sessions
- No database changes required
- Settings apply per browser/device

### 🔄 Real-time Updates
- Changes apply immediately to new documents
- Existing documents retain their original QR codes
- No need to regenerate old certificates

## How to Use

### Accessing Settings
1. Login to the Matrix Docs Forge portal
2. Click **Settings** in the navigation bar
3. Or go to Dashboard → Quick Actions → Settings

### Changing Verification URL
1. Navigate to Settings page
2. Enter your verification URL in the input field
3. URL must be valid (start with https:// or http://)
4. Remove any trailing slashes (system auto-corrects)
5. Click **Save Settings**
6. Confirmation toast will appear

### Resetting to Default
1. On Settings page, click **Reset to Default**
2. URL will revert to `https://matrixindustries.in/verify`
3. Click **Save Settings** to confirm

## Technical Details

### URL Format
- Base URL only (no path parameters)
- System automatically appends: `?code=<document-id>`
- Example:
  - Setting: `https://matrixindustries.in/verify`
  - QR Code: `https://matrixindustries.in/verify?code=550e8400-e29b-41d4-a716-446655440000`

### Storage Location
```javascript
// LocalStorage key
localStorage.setItem('verification_base_url', 'https://yoururl.com/verify');

// Retrieve
const url = localStorage.getItem('verification_base_url');
```

### Code Integration
```typescript
// In pdfGenerator.ts
import { getVerificationUrl } from './settings';

// Generate QR code URL
const qrCodeUrl = getVerificationUrl(data.verification_code);
```

## Files Added/Modified

### New Files:
- `src/pages/Settings.tsx` - Settings page component
- `src/lib/settings.ts` - Settings utility functions

### Modified Files:
- `src/lib/pdfGenerator.ts` - Uses `getVerificationUrl()` instead of hardcoded URL
- `src/App.tsx` - Added `/settings` route
- `src/components/Navbar.tsx` - Added Settings link
- `src/pages/Dashboard.tsx` - Added Settings quick action

## Validation Rules

### URL Validation:
✅ Must be valid URL format
✅ Must start with `http://` or `https://`
✅ Can include subdomain (e.g., verify.example.com)
✅ Can include path (e.g., example.com/verify)
❌ Cannot be empty
❌ Cannot include query parameters
❌ Cannot include fragments

### Examples:
```
✅ https://matrixindustries.in/verify
✅ https://verify.matrixindustries.in
✅ https://company.com/certificates/verify
✅ http://localhost:3000/verify (for testing)

❌ matrixindustries.in/verify (no protocol)
❌ https://matrixindustries.in/verify?code=123 (has query params)
❌ ftp://matrixindustries.in/verify (wrong protocol)
```

## Use Cases

### Production Website
```
URL: https://matrixindustries.in/verify
Use: Official company website verification
```

### Subdomain
```
URL: https://verify.matrixindustries.in
Use: Dedicated verification subdomain
```

### Development/Testing
```
URL: http://localhost:3000/verify
Use: Local testing before deployment
```

### Staging Environment
```
URL: https://staging.matrixindustries.in/verify
Use: Test verification flow before production
```

## Important Notes

### ⚠️ Existing Documents
- Changing the URL does **NOT** update existing documents
- Old certificates will still point to their original verification URL
- Only newly created documents will use the updated URL
- This is by design to maintain certificate integrity

### 🔒 Security
- Verification website must have HTTPS in production
- Ensure CORS is configured in Supabase for your domain
- RLS policies must allow public SELECT on documents table
- Never expose service role keys in client-side code

### 🌐 Multi-Domain Support
- Each browser/device can have different settings
- Useful for testing multiple environments
- Consider using different admin accounts for different domains

## Troubleshooting

### QR Code Still Shows Old URL
**Issue**: After changing URL, QR codes still point to old location
**Solution**: This is normal. Only NEW documents use the updated URL. Existing documents retain their original QR codes.

### Invalid URL Error
**Issue**: Cannot save URL, getting validation error
**Solution**: 
- Ensure URL starts with `http://` or `https://`
- Remove trailing slashes
- Remove any query parameters or fragments
- Check for typos in domain name

### Setting Not Persisting
**Issue**: URL resets after closing browser
**Solution**:
- Check browser's LocalStorage is enabled
- Ensure cookies/storage not being cleared on exit
- Try different browser
- Check for browser extensions blocking storage

### QR Code Not Working
**Issue**: Scanning QR code doesn't open verification page
**Solution**:
1. Verify the URL in Settings is correct
2. Ensure verification page is deployed at that URL
3. Check HTTPS certificate is valid
4. Test URL manually in browser
5. Verify Supabase CORS settings include your domain

## Future Enhancements

Potential improvements:
- [ ] Store settings in database per user
- [ ] Support multiple verification domains
- [ ] Custom QR code branding per domain
- [ ] Bulk update existing documents' QR codes
- [ ] Preview QR code before saving
- [ ] URL reachability test
- [ ] Analytics tracking per domain

## Support

For issues with the Settings feature:
1. Check browser console for errors
2. Verify LocalStorage is accessible
3. Try resetting to default URL
4. Check network connectivity
5. Refer to integration guide for verification page setup

---

**Last Updated**: October 27, 2025
**Version**: 1.0
