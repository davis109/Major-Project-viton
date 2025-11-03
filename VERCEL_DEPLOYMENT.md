# Vercel Deployment Guide for AI VITON

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **API Keys**: Have your Gemini and Segmind API keys ready

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepared for Vercel deployment with Gemini recommendations"
git push origin restore-deployment
```

### 2. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `Major-Project-viton` repository
4. Vercel will auto-detect it as a Next.js project

### 3. Configure Project Settings

**Framework Preset**: Next.js

**Root Directory**: `./` (leave as default)

**Build Settings**:
- Build Command: `cd frontend-next && npm install && npm run build`
- Output Directory: `frontend-next/.next`
- Install Command: `npm install`

### 4. Add Environment Variables

In Vercel project settings, add these environment variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here
SEGMIND_API_KEY=your_segmind_api_key_here
NEXT_PUBLIC_API_URL=/api
```

### 5. Deploy

Click "Deploy" and wait for the build to complete (3-5 minutes)

## Important Notes

### ⚠️ Backend Limitations

The Python backend on Vercel has limitations:

1. **Serverless Functions**: 
   - Max execution time: 60 seconds (can be extended with Pro plan)
   - Max deployment size: 250MB
   - No persistent file storage

2. **What Works**:
   - ✅ Gemini API recommendations (NEW feature you requested)
   - ✅ Segmind API virtual try-on
   - ✅ SQLite database (in-memory or uploaded)
   - ✅ Product search and catalog

3. **What Won't Work**:
   - ❌ Large ML models (PyTorch, diffusers) - too big for serverless
   - ❌ File uploads persist only during function execution
   - ❌ Local ChromaDB (unless you use cloud version)

### Alternative: Split Deployment

For a production app, I recommend:

**Option A - Vercel Frontend + Separate Backend**:
- Deploy Next.js frontend to Vercel
- Deploy Python backend to:
  - Railway (https://railway.app) - Good for Python + ML
  - Render (https://render.com) - Free tier available
  - Google Cloud Run - Better for ML workloads
  - AWS EC2 or Lambda (with larger limits)

**Option B - Full Vercel with External APIs**:
- Use Vercel for both frontend and lightweight backend
- Store images in cloud storage (S3, Cloudflare R2)
- Use hosted ChromaDB (cloud version)
- Rely on Segmind API for all try-ons

## Vercel CLI Deployment (Alternative)

If you prefer CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add SEGMIND_API_KEY

# Deploy to production
vercel --prod
```

## Post-Deployment

1. **Test the deployment**:
   - Visit your-app.vercel.app
   - Upload a photo
   - Try on a clothing item
   - Check if Gemini recommendations appear
   
2. **Monitor logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any errors in the backend

3. **Configure custom domain** (optional):
   - Vercel Dashboard → Your Project → Settings → Domains

## Troubleshooting

### Issue: Backend functions timeout
- Reduce recommendation count
- Use caching
- Consider splitting to external backend

### Issue: Images not loading
- Check CORS settings
- Verify API_BASE_URL is correct
- Ensure images are in public folder or use external storage

### Issue: Database not found
- Upload myntra.db to your repo (if < 50MB)
- Or use cloud database (PostgreSQL on Vercel/Supabase)

## Recommended Production Setup

For best results with your ML-heavy app:

```
Frontend (Vercel):
└── Next.js app
└── Static assets

Backend (Railway/Render):
└── FastAPI app
└── ML models
└── Database
└── File storage
```

Then set `NEXT_PUBLIC_API_URL=https://your-backend.railway.app` in Vercel.

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Test backend endpoints individually
3. Verify all environment variables are set
4. Check the Vercel function logs for Python errors

---

**Note**: The new Gemini recommendation feature you requested is optimized for serverless and should work perfectly on Vercel! 🚀
