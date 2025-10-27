# 📄 Matrix Industries - Document Management Portal# Welcome to your Lovable project



A modern, secure admin portal for generating and managing internship certificates, offer letters, and letters of recommendation with QR code verification.## Project info



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)**URL**: https://lovable.dev/projects/86838346-2078-45d0-a885-63392284ba65

![License](https://img.shields.io/badge/license-MIT-green.svg)

## How can I edit this code?

## ✨ Features

There are several ways of editing your application.

- 🎓 **Certificate Generation** - Internship completion certificates

- 💼 **Offer Letters** - Professional job offer letters  **Use Lovable**

- 📝 **Letters of Recommendation** - LOR generation

- 📊 **Bulk Upload** - CSV-based batch document creationSimply visit the [Lovable Project](https://lovable.dev/projects/86838346-2078-45d0-a885-63392284ba65) and start prompting.

- 🔍 **QR Verification** - Built-in verification system

- 📱 **Mobile Responsive** - Works on all devicesChanges made via Lovable will be committed automatically to this repo.

- 🔒 **Secure Authentication** - Supabase-powered auth

- ⚙️ **Configurable** - Settings for custom verification URLs**Use your preferred IDE**

- 📈 **Dashboard** - Analytics and quick actions

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

## 🚀 Quick Start

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Prerequisites

Follow these steps:

- Node.js 18+ 

- npm or bun```sh

- Supabase account# Step 1: Clone the repository using the project's Git URL.

- Gitgit clone <YOUR_GIT_URL>



### Installation# Step 2: Navigate to the project directory.

cd <YOUR_PROJECT_NAME>

```bash

# Clone the repository# Step 3: Install the necessary dependencies.

git clone <your-repo-url>npm i

cd matrix-docs-forge-main

# Step 4: Start the development server with auto-reloading and an instant preview.

# Install dependenciesnpm run dev

npm install```



# Copy environment variables**Edit a file directly in GitHub**

cp .env.example .env.local

- Navigate to the desired file(s).

# Edit .env.local with your Supabase credentials- Click the "Edit" button (pencil icon) at the top right of the file view.

# Get from: https://app.supabase.com → Your Project → Settings → API- Make your changes and commit the changes.



# Run development server**Use GitHub Codespaces**

npm run dev

```- Navigate to the main page of your repository.

- Click on the "Code" button (green button) near the top right.

Visit `http://localhost:8080`- Select the "Codespaces" tab.

- Click on "New codespace" to launch a new Codespace environment.

## 🔑 Default Access- Edit files directly within the Codespace and commit and push your changes once you're done.



- **Access Code**: `MAI@0320`## What technologies are used for this project?

- **Admin Email**: `admin@matrixindustries.in`

This project is built with:

## 📦 Tech Stack

- Vite

- **Frontend**: React 18 + TypeScript- TypeScript

- **Build Tool**: Vite- React

- **UI Framework**: Shadcn/ui + Tailwind CSS- shadcn-ui

- **Database**: Supabase (PostgreSQL)- Tailwind CSS

- **Storage**: Supabase Storage

- **Auth**: Supabase Auth## How can I deploy this project?

- **PDF Generation**: jsPDF

- **QR Codes**: qrcode librarySimply open [Lovable](https://lovable.dev/projects/86838346-2078-45d0-a885-63392284ba65) and click on Share -> Publish.

- **Router**: React Router DOM

- **Deployment**: Vercel## Can I connect a custom domain to my Lovable project?



## 📁 Project StructureYes, you can!



```To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

matrix-docs-forge/

├── src/Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

│   ├── assets/           # Images and logos
│   ├── components/       # Reusable components
│   │   ├── ui/          # Shadcn UI components
│   │   └── Navbar.tsx   # Navigation component
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and config
│   │   ├── pdfGenerator.ts   # PDF generation logic
│   │   ├── settings.ts       # Settings management
│   │   ├── storage.ts        # File upload utilities
│   │   └── supabase.ts       # Supabase client
│   ├── pages/           # Page components
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateDocument.tsx
│   │   ├── Documents.tsx
│   │   ├── BulkUpload.tsx
│   │   ├── Settings.tsx
│   │   └── Verify.tsx
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── DEPLOYMENT.md        # Deployment guide
└── README.md            # This file
```

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# https://vercel.com/new

# 3. Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

# 4. Deploy!
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete Vercel deployment instructions
- [Settings Feature](./SETTINGS_FEATURE.md) - Configurable verification URLs
- [Website Integration](./MATRIX_WEBSITE_VERIFICATION_INTEGRATION.md) - Verification page setup
- [Storage Fix](./STORAGE_FIX.md) - Supabase storage configuration
- [PDF Design](./PDF_DESIGN_IMPROVEMENTS.md) - PDF template details

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Secure authentication
- ✅ Environment variables for secrets
- ✅ HTTPS enforced in production
- ✅ CORS properly configured
- ✅ XSS protection headers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation files
2. Review troubleshooting in DEPLOYMENT.md
3. Contact your development team

## 🎯 Roadmap

- [ ] Email delivery of documents
- [ ] Multi-language support
- [ ] Template customization
- [ ] Advanced analytics
- [ ] Bulk verification
- [ ] API endpoints

---

**Built with ❤️ by Matrix Industries**

Last Updated: October 27, 2025
