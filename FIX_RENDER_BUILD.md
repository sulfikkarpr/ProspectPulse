# 🔧 Fix: Render Build Error - Cannot find type definition file for 'node'

## Problem
```
error TS2688: Cannot find type definition file for 'node'.
npm error Lifecycle script `build` failed with error
```

## Root Cause
Render is running `npm install` in production mode, which **skips devDependencies**. But we need:
- `typescript` (to compile)
- `@types/node` (for TypeScript types)

These are in `devDependencies`, so they're not being installed.

## Solution

### Option 1: Update Build Command in Render Dashboard (Recommended)

1. **Go to Render Dashboard:**
   - Your service → **Settings** → **Build & Deploy**

2. **Update Build Command:**
   Change from:
   ```
   npm install && npm run build
   ```
   
   To:
   ```
   npm install --include=dev && npm run build
   ```

3. **Save and Redeploy**

### Option 2: Use .npmrc File (Already Added)

I've created `backend/.npmrc` that tells npm to install devDependencies:
```
production=false
```

This file is already in your repo. Just **redeploy** in Render.

### Option 3: Update render.yaml (Already Updated)

The `render.yaml` file has been updated to:
```yaml
buildCommand: cd backend && npm install --include=dev && npm run build
```

**Note:** If you're using the Render dashboard (not render.yaml), you need to update the build command manually in the dashboard.

---

## Quick Fix Steps

1. **In Render Dashboard:**
   - Go to your service
   - Click **Settings** → **Build & Deploy**
   - Find **Build Command**
   - Change to: `npm install --include=dev && npm run build`
   - Click **Save Changes**

2. **Redeploy:**
   - Go to **Manual Deploy** tab
   - Click **Deploy latest commit**

---

## Alternative: Move to Dependencies (Not Recommended)

You could move `typescript` and `@types/node` to `dependencies`, but this increases production bundle size unnecessarily. The above solution is better.

---

## Verify Fix

After redeploying, check the build logs. You should see:
```
added 141 packages (including devDependencies)
> tsc
✓ Build successful
```

---

**The build should now work!** 🎉

