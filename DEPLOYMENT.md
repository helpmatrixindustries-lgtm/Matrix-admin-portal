# 🚀 Deployment Guide - Matrix Docs Forge

## Production Deployment on Vercel

This guide will help you deploy the Matrix Docs Forge application to Vercel for production use.

---

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] Supabase project set up with database and storage
- [x] All code committed to a GitHub repository

---

## Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for production deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/matrix-docs-forge.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify Files

Ensure these files exist in your repository:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment variables template
- ✅ `package.json` - Dependencies
- ✅ `vite.config.ts` - Build configuration
- ✅ All assets in `src/assets/` folder

---

## Step 2: Get Supabase Credentials

### 2.1 Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your Matrix Industries project
3. Go to **Settings** → **API**

### 2.2 Copy Required Values

You need:
- **Project URL**: `https://your-project.supabase.co`
- **Anon (public) Key**: `eyJhbGci...` (long string)

⚠️ **Important**: Use the **anon public** key, NOT the service role key!

---

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the `matrix-docs-forge` repository

### 3.2 Configure Project

Vercel should auto-detect the settings:
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables

In the Vercel project settings, add these environment variables:

| Name | Value | Example |
|------|-------|---------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhbGci...` |

**Steps**:
1. Scroll to **"Environment Variables"** section
2. Click **"Add"**
3. Enter variable name
4. Paste value
5. Select **"Production", "Preview", and "Development"**
6. Click **"Add"**
7. Repeat for all variables

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at `https://your-project.vercel.app`

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Vercel project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `docs.matrixindustries.in`)
4. Follow DNS configuration instructions

### 4.2 Update DNS Records

Add these DNS records in your domain provider:

**For subdomain (e.g., docs.matrixindustries.in)**:
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
```

**For root domain (e.g., matrixindustries.in)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 4.3 Update Settings

After domain is verified:
1. Go to **Settings** page in your deployed app
2. Update verification URL to your custom domain
3. Example: `https://docs.matrixindustries.in/verify`

---

## Step 5: Configure Supabase CORS

### 5.1 Add Allowed Origins

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**:
   - `https://your-project.vercel.app`
   - Or your custom domain: `https://docs.matrixindustries.in`

3. Add to **Redirect URLs** (same as above)

### 5.2 Update Storage Policies

Ensure storage policies allow your domain (should already be set up from initial configuration).

---

## Step 6: Test Deployment

### 6.1 Access Your Application

Visit your deployed URL:
- `https://your-project.vercel.app`
- Or your custom domain

### 6.2 Test Core Features

- [ ] Login with access code (MAI@0320)
- [ ] Create a new document
- [ ] Verify PDF generates correctly
- [ ] Check QR code works
- [ ] Test verification page
- [ ] Upload bulk documents
- [ ] View documents list
- [ ] Check Settings page
- [ ] Test logout/login flow

### 6.3 Check Assets

- [ ] Logo displays correctly
- [ ] All images load
- [ ] PDFs show logos properly
- [ ] QR codes generate correctly

---

## Step 7: Ongoing Maintenance

### 7.1 Update Deployment

When you make changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically rebuild and deploy!

### 7.2 Monitor Deployments

- View build logs in Vercel dashboard
- Check for errors in deployment logs
- Monitor analytics (optional)

### 7.3 Environment Variables

To update environment variables:
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Click on variable to edit
3. Update value
4. Redeploy (automatic or manual trigger)

---

## Troubleshooting

### Build Fails

**Issue**: Vercel build fails with errors

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node version (should use v18 or higher)
4. Check for TypeScript errors locally: `npm run build`

### Environment Variables Not Working

**Issue**: App can't connect to Supabase

**Solutions**:
1. Verify environment variables are set correctly
2. Ensure variable names start with `VITE_`
3. Check Supabase URL and key are correct
4. Redeploy after adding variables

### Assets Not Loading

**Issue**: Images/logos don't display

**Solutions**:
1. Verify assets are in `src/assets/` folder
2. Check import paths use `@/assets/...`
3. Ensure images are committed to Git
4. Check browser console for 404 errors

### CORS Errors

**Issue**: Supabase requests blocked by CORS

**Solutions**:
1. Add Vercel URL to Supabase allowed origins
2. Check Supabase → Settings → API → CORS
3. Ensure using anon key, not service role key

### QR Codes Show Wrong URL

**Issue**: QR codes point to localhost or wrong domain

**Solutions**:
1. Go to Settings page in deployed app
2. Update verification URL to production domain
3. Generate new documents
4. Note: Old documents keep original QR codes

### 404 on Page Refresh

**Issue**: Refreshing pages shows 404

**Solutions**:
1. Verify `vercel.json` exists with rewrite rules
2. Check Vercel logs for routing errors
3. Ensure SPA routing is configured

---

## Performance Optimization

### Caching

Vercel automatically caches:
- ✅ Static assets (images, fonts)
- ✅ Build outputs
- ✅ API responses (if configured)

### Asset Optimization

Already configured:
- ✅ Vite builds optimized bundles
- ✅ Code splitting enabled
- ✅ Tree shaking active
- ✅ Minification applied

### CDN

Vercel serves from global CDN:
- ✅ Edge network
- ✅ HTTPS by default
- ✅ Automatic compression

---

## Security Checklist

- [x] Environment variables not committed to Git
- [x] `.env.local` in `.gitignore`
- [x] Using anon key (not service role key)
- [x] HTTPS enabled (automatic on Vercel)
- [x] RLS policies enabled in Supabase
- [x] Security headers configured in `vercel.json`
- [x] CORS properly configured

---

## Production URLs

After deployment, update these in Settings:

### Verification URL
- Set to: `https://your-domain.com/verify`
- Or: `https://matrixindustries.in/verify` (your website)

### Application URL
- Admin Portal: `https://your-project.vercel.app`
- Or Custom: `https://docs.matrixindustries.in`

---

## Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)

### Common Commands

```bash
# Local development
npm run dev

# Build for production (test locally)
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

---

## Checklist: Ready for Production

Before deploying, ensure:

- [ ] Code committed to GitHub
- [ ] All assets present in `src/assets/`
- [ ] Supabase project configured
- [ ] Database tables created
- [ ] Storage bucket set up
- [ ] RLS policies active
- [ ] Environment variables ready
- [ ] Build tested locally (`npm run build`)
- [ ] No console errors
- [ ] All features tested
- [ ] Documentation reviewed

---

## Quick Deploy Commands

```bash
# 1. Ensure everything is committed
git add .
git commit -m "Production ready"
git push origin main

# 2. Go to Vercel dashboard
# 3. Import repository
# 4. Add environment variables
# 5. Deploy!
```

---

**🎉 Congratulations!** 

Your Matrix Docs Forge application is now deployed and ready for production use!

---

**Last Updated**: October 27, 2025
**Version**: 1.0
