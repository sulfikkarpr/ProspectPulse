# 🆓 Free Backend Deployment Options

## Best Free Options for Node.js/Express Backend

### Option 1: Render (Recommended) ⭐
**Free Tier:**
- ✅ Free forever
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 minutes of inactivity (takes ~30 seconds to wake up)
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration

**Deployment Steps:**

1. **Sign Up:**
   - Go to: https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select `ProspectPulse` repository

3. **Configure Service:**
   - **Name:** `prospectpulse-backend`
   - **Region:** Choose closest to you (e.g., Singapore for India)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT**
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Environment Variables:**
   Click "Environment" and add ALL these:
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://prospect-pulse-frontend.vercel.app
   JWT_SECRET=your-super-secret-jwt-key-change-this
   DATABASE_URL=postgresql://... (your Supabase pooler URL)
   GOOGLE_CLIENT_ID=5614789434-msigvf64drqnjcf4475cv1agmm6trv3k.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback
   GOOGLE_SHEETS_ID=your-google-sheets-id
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment
   - ✅ You'll get a URL like: `https://prospectpulse-backend.onrender.com`

**Note:** After inactivity, the service spins down. First request takes ~30 seconds to wake up.

---

### Option 2: Railway
**Free Tier:**
- ✅ $5 free credit monthly (enough for small apps)
- ✅ No spin-down (always on)
- ⚠️ After free credit, costs ~$5/month
- ✅ Very easy setup

**Deployment Steps:**

1. **Sign Up:**
   - Go to: https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub

2. **Create Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `ProspectPulse` repository

3. **Configure Service:**
   - Click on the service
   - Go to "Settings"
   - Set **Root Directory:** `backend`
   - Set **Build Command:** `npm install && npm run build`
   - Set **Start Command:** `npm start`

4. **Environment Variables:**
   - Go to "Variables" tab
   - Add all the same variables as Render (see above)

5. **Deploy:**
   - Railway auto-deploys
   - ✅ You'll get a URL like: `https://your-app.up.railway.app`

---

### Option 3: Fly.io
**Free Tier:**
- ✅ Free tier available
- ✅ 3 shared-cpu VMs
- ✅ 3GB persistent volumes
- ⚠️ More complex setup

**Deployment Steps:**

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign Up:**
   - Go to: https://fly.io
   - Sign up for free account

3. **Deploy:**
   ```bash
   cd backend
   fly launch
   ```
   Follow the prompts.

**Note:** More technical, but very reliable.

---

### Option 4: Cyclic
**Free Tier:**
- ✅ Free forever
- ✅ Always on
- ✅ Easy GitHub integration
- ⚠️ Limited resources

**Deployment Steps:**

1. **Sign Up:**
   - Go to: https://cyclic.sh
   - Sign up with GitHub

2. **Deploy:**
   - Click "Deploy Now"
   - Connect GitHub repo
   - Select `ProspectPulse`
   - Set root directory to `backend`
   - Add environment variables
   - Deploy!

---

## Comparison

| Platform | Free Tier | Always On | Ease of Use | Best For |
|----------|-----------|-----------|-------------|----------|
| **Render** | ✅ Yes | ⚠️ Spins down | ⭐⭐⭐⭐⭐ | Most users |
| **Railway** | ✅ $5 credit | ✅ Yes | ⭐⭐⭐⭐⭐ | Always-on needed |
| **Fly.io** | ✅ Yes | ✅ Yes | ⭐⭐⭐ | Technical users |
| **Cyclic** | ✅ Yes | ✅ Yes | ⭐⭐⭐⭐ | Simple apps |

---

## Recommendation

**For most users: Use Render**
- Easiest to set up
- Free forever
- Good documentation
- Spins down after inactivity (but wakes up quickly)

**If you need always-on: Use Railway**
- $5/month after free credit
- Never spins down
- Best performance

---

## After Deployment

1. **Get your backend URL:**
   - Render: `https://your-app.onrender.com`
   - Railway: `https://your-app.up.railway.app`

2. **Update Vercel environment variable:**
   - Go to Vercel → Your project → Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://your-backend-url.com/api`

3. **Update Google OAuth redirect URI:**
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client
   - Add redirect URI: `https://your-backend-url.com/api/auth/callback`

4. **Redeploy frontend:**
   - Vercel will auto-redeploy, or manually trigger redeploy

---

## Quick Start: Render (Recommended)

1. Go to: https://render.com
2. Sign up with GitHub
3. New + → Web Service
4. Connect `ProspectPulse` repo
5. Set Root Directory: `backend`
6. Add environment variables
7. Deploy!

**That's it! Your backend will be live in ~10 minutes.** 🚀

---

## Troubleshooting

### Render: Service won't start
- Check build logs
- Verify all environment variables are set
- Check `package.json` has `start` script

### Railway: Out of credits
- Upgrade to paid ($5/month)
- Or switch to Render (free)

### Connection timeout
- Normal for Render (spins down after inactivity)
- First request takes ~30 seconds
- Subsequent requests are fast

---

**Choose Render for the easiest free deployment!** 🎉

