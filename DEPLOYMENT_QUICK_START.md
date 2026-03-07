#  Quick Deployment Guide |   

##  Website Deployment (GitHub Pages)

Your website is **ALREADY DEPLOYED** at:

** https://zedanazad43.github.io/stp/**

 Automatic deployment on every push to `main` branch

---

##  Backend API Deployment (Choose One)

Choose your preferred platform below:

### Option 1: Railway ( Recommended - Easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy
railway up

# 4. Set environment variable
railway variable add SYNC_TOKEN=your-secret-token-here
```

**Result**: Your API will be at `https://stampcoin-platform.railway.app`

---

### Option 2: Render (Free Tier Available)

1. Go to https://render.com
2. Click **New  Web Service**
3. Connect your GitHub repo `zedanazad43/stp`
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variable**: `SYNC_TOKEN=your-secret-token-here`
5. Click **Deploy**

**Result**: Your API will be at `https://stampcoin-api.onrender.com`

---

### Option 3: Vercel (Serverless)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Add environment variable in Vercel dashboard
# Settings  Environment Variables  Add SYNC_TOKEN
```

**Result**: Your API will be at `https://stampcoin-platform.vercel.app`

---

### Option 4: Fly.io (Global Deployment)

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Launch
fly launch

# 4. Deploy
fly deploy

# 5. Set secret
fly secrets set SYNC_TOKEN=your-secret-token-here
```

**Result**: Your API will be at `https://stampcoin-platform.fly.dev`

---

### Option 5: Heroku (Legacy but Stable)

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create stampcoin-platform

# 4. Set environment variable
heroku config:set SYNC_TOKEN=your-secret-token-here

# 5. Deploy
git push heroku main
```

**Note**: Heroku free tier is no longer available (requires credit card)

**Result**: Your API will be at `https://stampcoin-platform.herokuapp.com`

---

##  Deployment Checklist

After deploying your backend, verify:

- [ ] Website accessible at https://zedanazad43.github.io/stp/
- [ ] API responds to `/sync` endpoint
- [ ] Authentication token is set
- [ ] CORS is enabled (check in browser console)
- [ ] No errors in deployment logs

---

##  Test Your Deployment

### Test the API

```bash
# Replace <your-api-url> with your deployed API URL
# and <token> with your SYNC_TOKEN

# Test sync endpoint
curl -X GET <your-api-url>/sync \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Should return: {"todos":[]}
```

### Test in Browser

Open browser console and run:

```javascript
fetch('https://your-api-url/sync', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

---

##  Monitoring Your Deployment

### Railway
- Dashboard: https://railway.app
- View logs: Dashboard  Deployments  Logs

### Render
- Dashboard: https://render.com/dashboard
- View logs: Service  Logs tab

### Vercel
- Dashboard: https://vercel.com/dashboard
- View logs: Project  Deployments  Logs

### Fly.io
- View logs: `fly logs`
- Dashboard: `fly dashboard`

### Heroku
- View logs: `heroku logs --tail`
- Dashboard: https://dashboard.heroku.com

---

##  Security Best Practices

1. **Never commit SYNC_TOKEN** - Use environment variables only
2. **Use strong tokens** - Generate random 32+ character strings
3. **Enable HTTPS** - All platforms provide HTTPS automatically
4. **Rate limiting** - Add rate limiting for production APIs
5. **CORS configuration** - Only allow trusted origins

### Generate a Secure Token

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach-Object{[byte](Get-Random -Min 0 -Max 256)}))
```

---

##  Full Deployment Example

### Complete setup for Railway:

```bash
# 1. Navigate to repository
cd stp

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Login
railway login

# 4. Deploy
railway up

# 5. Open dashboard to add environment variable
railway dashboard

# 6. Add SYNC_TOKEN variable

# 7. Get your API URL
railway variables list

# 8. Test it
curl -X GET https://your-railway-url/sync \
  -H "Authorization: Bearer your-token"
```

That's it! 

---

##  Full Documentation

For detailed information about each platform, see:
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide with all platforms
- **[INSTALLATION.md](INSTALLATION.md)** - Local installation instructions
- **[README.md](README.md)** - Project overview

---

##  Troubleshooting

### API returns 401 Unauthorized
- Check `SYNC_TOKEN` is set correctly
- Verify token in Authorization header: `Bearer <token>`

### Website shows 404
- Check GitHub Pages is enabled in repo Settings
- Verify deployment succeeded in Actions tab

### CORS errors in browser
- CORS is enabled in `server.js`
- Check your API URL doesn't have trailing slash

### Port errors
- Railway, Render, etc. automatically set PORT environment variable
- Don't hardcode port 8080 in production code

---

##  Next Steps

1.  Deploy website (GitHub Pages) - **Already done!**
2.  Deploy backend API (Choose platform above)
3.  Monitor your deployments
4.  Set up automated backups
5.  Configure custom domain (optional)

**You're all set!** 
