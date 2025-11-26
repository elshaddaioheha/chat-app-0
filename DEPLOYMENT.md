# Deployment Guide

This guide will help you deploy the Chat App to various platforms.

## Prerequisites

Before deploying, ensure you have:
- All environment variables configured (see `.env.example`)
- Supabase database tables created (see README.md)
- Clerk application set up

## Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
vercel
```

### Step 3: Add Environment Variables
In the Vercel dashboard, go to your project settings and add:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENCRYPTION_KEY`

### Step 4: Redeploy
```bash
vercel --prod
```

## Netlify Deployment

### Step 1: Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

### Step 2: Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENCRYPTION_KEY`

### Step 3: Deploy
Connect your Git repository or drag and drop the `dist` folder.

## Other Platforms

### GitHub Pages
1. Build the project: `npm run build`
2. Configure GitHub Actions to deploy the `dist` folder
3. Set environment variables as GitHub Secrets

### Railway/Render/Fly.io
1. Set build command: `npm run build`
2. Set start command: `npm run preview`
3. Add environment variables in platform settings
4. Configure output directory: `dist`

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase RLS policies are configured
- [ ] Clerk domain is whitelisted
- [ ] CORS settings are configured in Supabase
- [ ] Test authentication flow
- [ ] Test messaging functionality
- [ ] Test group creation
- [ ] Verify notifications work

## Troubleshooting

### Build Fails
- Check Node.js version (v18+ required)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript compilation: `npm run build`

### Authentication Issues
- Verify Clerk publishable key
- Check Clerk dashboard for domain whitelist
- Verify CORS settings

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Verify database tables exist

### Runtime Errors
- Check browser console for errors
- Verify all environment variables are set
- Check Supabase logs for database errors

