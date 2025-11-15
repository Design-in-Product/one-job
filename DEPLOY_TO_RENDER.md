# 🚀 Deploy One Job Backend to Render.com

**Estimated time**: 10-15 minutes
**Cost**: Free (database free for 90 days, then $7/month)

---

## 📋 Prerequisites

- [ ] GitHub repository with your code
- [ ] Render.com account (sign up at https://render.com - it's free!)
- [ ] Your code committed and pushed to GitHub

---

## Step 1: Push Your Code to GitHub (if not already done)

**IMPORTANT**: Check which branch you're on:

```bash
git branch
```

You should see: `* claude/claude-code-browser-experiment-011z9BqgSUUPkhPeuSCEQGoT`

**If you're NOT on main branch**, you need to either:
- **Option A**: Merge your branch to `main` and push
- **Option B**: Update `render.yaml` line 17 to use your current branch

### Option A: Merge to main (Recommended)

```bash
# Switch to main
git checkout main

# Merge your feature branch
git merge claude/claude-code-browser-experiment-011z9BqgSUUPkhPeuSCEQGoT

# Push to GitHub
git push origin main
```

### Option B: Deploy from your current branch

Edit `render.yaml` line 17:
```yaml
branch: claude/claude-code-browser-experiment-011z9BqgSUUPkhPeuSCEQGoT
```

Then push your branch:
```bash
git add render.yaml
git commit -m "Update render config for deployment"
git push origin claude/claude-code-browser-experiment-011z9BqgSUUPkhPeuSCEQGoT
```

---

## Step 2: Sign up for Render.com

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest option - it'll auto-connect your repos)
4. Authorize Render to access your GitHub

---

## Step 3: Create New Web Service

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Blueprint"** from the dropdown
3. Select your **"one-job"** repository from the list
4. If you don't see it, click **"Configure account"** to grant Render access to the repo

---

## Step 4: Let Render Read the Blueprint

Render will automatically detect your `render.yaml` file and show you what it's going to create:

**You should see**:
- ✅ Web Service: `one-job-api`
- ✅ PostgreSQL: `one-job-db`

Click **"Apply"** to create both services.

---

## Step 5: Wait for Deployment (5-10 minutes)

Render will now:
1. ✅ Create the PostgreSQL database
2. ✅ Create the web service
3. ✅ Install Python dependencies (`pip install -r requirements.txt`)
4. ✅ Start your FastAPI app with gunicorn

**What you'll see**:
- Logs streaming in real-time
- Lines like: `Running pip install...`
- Finally: `Starting gunicorn...`

**Don't panic if you see**:
- "Waiting for database..." (normal)
- Timeout warnings (normal for free tier)

---

## Step 6: Get Your API URL

Once deployed (you'll see "Live" with a green dot):

1. Click on your **"one-job-api"** service
2. At the top, you'll see your URL: `https://one-job-api.onrender.com`
3. **COPY THIS URL** - you'll need it!

---

## Step 7: Test Your Backend

Open your browser and visit:

```
https://one-job-api.onrender.com/docs
```

You should see the **FastAPI auto-generated docs** (Swagger UI)!

Try these endpoints:
- `GET /tasks` - Should return `[]` (empty array - no tasks yet)
- `GET /projects` - Should return `[]` (empty array - no projects yet)

---

## Step 8: Create Your First Project

In the Swagger UI:

1. Find `POST /projects`
2. Click **"Try it out"**
3. Paste this JSON:
```json
{
  "name": "My First Project",
  "description": "Testing production deployment",
  "color": "#3B82F6"
}
```
4. Click **"Execute"**
5. You should get a `201 Created` response!

---

## Step 9: Update Your Frontend

Now we need to tell your frontend to use the production backend instead of `localhost:8000`.

**Create a new file**: `src/config.ts` (if it doesn't exist already)

Or update it to:

```typescript
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://one-job-api.onrender.com'  // ← Your Render URL here
    : 'http://127.0.0.1:8000'  // Development
  );

export const isDemoMode = false;
```

**Important**: Replace `https://one-job-api.onrender.com` with YOUR actual Render URL from Step 6!

---

## Step 10: Add CORS for Your Frontend

Your backend needs to allow requests from your frontend domain.

**Edit**: `backend/main.py`

Find the CORS middleware section (around line 15-20) and update:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Local development
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "https://onejob.co",  # Your production frontend
        "https://www.onejob.co",
        "https://*.onrender.com",  # Allow Render preview deploys
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then commit and push:

```bash
git add backend/main.py src/config.ts
git commit -m "Configure production API URL and CORS"
git push
```

Render will **auto-deploy** your changes! (takes ~5 min)

---

## Step 11: Deploy Your Frontend

Since your frontend is already on GitHub Pages at `onejob.co`, you just need to:

```bash
# Make sure frontend is using production config
npm run build

# Deploy to GitHub Pages (if you have a deploy script)
# Or commit and push the build
```

---

## 🎉 You're Done!

Your app is now live:
- **Backend**: `https://one-job-api.onrender.com`
- **Frontend**: `https://onejob.co`
- **Database**: PostgreSQL on Render

---

## 🐛 Troubleshooting

### "Service Unavailable" or 502 errors
- **Cause**: Free tier services sleep after 15 minutes of inactivity
- **Solution**: First request will be slow (~30 seconds) while it wakes up
- **Fix**: Upgrade to paid plan ($7/month) for always-on

### "Database connection failed"
- **Cause**: Database not ready or wrong DATABASE_URL
- **Solution**:
  1. Check Render dashboard → Database → "Connect" tab
  2. Copy the "Internal Database URL"
  3. Render should auto-configure this, but verify in service settings

### "Module not found" errors
- **Cause**: Missing dependency in requirements.txt
- **Solution**: Add it to `requirements.txt` and push

### CORS errors in browser console
- **Cause**: Frontend domain not in CORS allowlist
- **Solution**: Add your frontend URL to `allow_origins` in main.py

### Database is empty / no tables
- **Cause**: SQLAlchemy hasn't created tables yet
- **Solution**: Tables are created automatically on first request
  - Just make a GET request to `/tasks` or `/projects`

---

## 💡 Pro Tips

1. **Check Logs**: Render Dashboard → Your Service → "Logs" tab
2. **Manual Deploy**: Click "Manual Deploy" → "Deploy latest commit"
3. **Environment Variables**: Dashboard → Service → "Environment" tab
4. **Database Access**: Use the "Shell" tab to run SQL directly
5. **Free Tier Limits**:
   - Web service sleeps after 15 min inactivity
   - 750 hours/month (plenty for personal use)
   - Database is 1GB storage

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files (they're in `.gitignore`)
- [ ] Use Render's environment variables for secrets
- [ ] HTTPS is automatic (Render provides free SSL)
- [ ] Database credentials are auto-generated and secure
- [ ] CORS is properly configured

---

## 📊 Monitoring

Visit your Render dashboard to see:
- 📈 Request graphs
- 📝 Real-time logs
- 💾 Database usage
- ⚡ Performance metrics

---

## 💰 Costs

- **Web Service**: Free tier (750 hours/month, sleeps after 15min)
- **Database**: Free for 90 days, then $7/month
- **Total**: $0/month for first 90 days, then $7/month

To keep it free forever:
- Recreate the database every 90 days (export data first!)
- Or switch to SQLite in production (not recommended)

---

## 🆘 Need Help?

If something goes wrong:

1. **Check the logs**: Render Dashboard → Logs tab
2. **Read the error message**: They're usually helpful!
3. **Common fixes**:
   - Push a commit to trigger redeploy
   - Click "Clear build cache & deploy"
   - Check environment variables are set
4. **Still stuck?**: Open an issue or ask in the Render community

---

**Happy deploying!** 🎉

Your One Job app is about to go live to the world! 🌍
