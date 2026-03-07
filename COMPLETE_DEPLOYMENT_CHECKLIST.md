#  Complete Deployment Checklist |    

##  PHASE 1: GitHub & Render (IMMEDIATE)

### GitHub Deployment:
- [x] Code pushed to GitHub
- [ ] Go to: https://github.com/zedanazad43/stp/settings/pages
- [ ] Select: Deploy from a branch
- [ ] Branch: main
- [ ] Folder: / (root)
- [ ] Click Save
- [ ] Website will be at: https://zedanazad43.github.io/stp/

### Render Deployment:
- [ ] Go to: https://render.com
- [ ] Sign up with GitHub
- [ ] Click: + New  Web Service
- [ ] Click: Connect a repository
- [ ] Search: zedanazad43/stp
- [ ] Click: Connect

**Configuration:**
```
Name:           stampcoin-api
Environment:    Node
Build Command:  npm install
Start Command:  npm start
Plan:           Free (or Starter for always-on)
```

**Environment Variables:**
```
SYNC_TOKEN = (generate random token)
```

- [ ] Click: Create Web Service
- [ ] Wait 5-10 minutes for deployment
- [ ] API will be at: https://stampcoin-api.onrender.com/sync
- [ ] Test: curl -X GET your-api-url/sync -H "Authorization: Bearer token"

---

##  PHASE 2: Domain Purchase (OPTIONAL but Recommended)

### Choose Domain Registrar:
- [ ] Option 1: **Namecheap** ($8.88/year) - https://namecheap.com
- [ ] Option 2: **Google Domains** ($12/year) - https://domains.google
- [ ] Option 3: **GoDaddy** ($0.99 first year) - https://godaddy.com
- [ ] Option 4: Skip for now (use onrender.com)

### Buy Domain:
- [ ] Search for: `stampcoin.com` (or your choice)
- [ ] Add WHOIS Privacy (if available, usually free)
- [ ] Complete purchase
- [ ] Receive confirmation email

---

##  PHASE 3: DNS Configuration (If You Bought Domain)

### Add DNS Records:

**Record 1 - Website (GitHub Pages):**
```
Type:  CNAME
Name:  www
Value: zedanazad43.github.io
TTL:   3600
```

**Record 2 - API (Render):**
```
Type:  CNAME
Name:  api
Value: stampcoin-api.onrender.com
TTL:   3600
```

**How to add (example for Namecheap):**
1. Go to your domain settings
2. Find "Advanced DNS" or "DNS Management"
3. Add the records above
4. Click Save

---

##  PHASE 4: Connect Domain to Services

### Connect Domain to GitHub Pages:
1. Go to: https://github.com/zedanazad43/stp/settings/pages
2. Under "Custom domain", enter: `stampcoin.com`
3. Click Save
4. GitHub will verify (may take a few minutes)
5. Under "Enforce HTTPS", click checkbox
6. Wait for SSL certificate (usually 24 hours)

### Connect Domain to Render:
- Already configured via DNS (api.stampcoin.com)
- No additional steps needed

---

##  PHASE 5: Verification

### Test Website:
- [ ] `https://zedanazad43.github.io/stp/` (always works)
- [ ] `https://stampcoin.com` (if domain configured)
- [ ] `https://www.stampcoin.com` (if domain configured)
- [ ] Page should load without errors

### Test API:
- [ ] `https://stampcoin-api.onrender.com/sync` (always works)
- [ ] `https://api.stampcoin.com/sync` (if domain configured)

```bash
# In terminal
curl -X GET https://stampcoin-api.onrender.com/sync \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"

# Should return: {"todos":[]}
```

### Test in Browser Console:
```javascript
fetch('https://stampcoin-api.onrender.com/sync', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(r => r.json())
.then(d => console.log(d))
// Should log: {todos: []}
```

---

##  FINAL URLS

### With Domain (if purchased):
```
Website:  https://stampcoin.com
API:      https://api.stampcoin.com/sync
```

### Without Domain:
```
Website:  https://zedanazad43.github.io/stp/
API:      https://stampcoin-api.onrender.com/sync
```

---

##  Timeline

| Step | Time | Status |
|------|------|--------|
| GitHub Pages | 1 min |  |
| Render Deploy | 5-10 min |  |
| Domain Purchase | 5 min |  Optional |
| DNS Setup | 5 min |  Optional |
| DNS Propagation | 24 hours |  Optional |
| HTTPS Certificate | 24 hours |  Optional |

**Minimum time to live (without domain): 10 minutes**
**Full setup (with domain): 24 hours**

---

##  Costs

| Item | Cost | Notes |
|------|------|-------|
| GitHub Pages | FREE | Forever |
| Render API | FREE | Free tier, sleeps after 15 min inactivity |
| Domain | $8-15/year | Optional, start $8.88 (Namecheap) |
| SSL Certificate | FREE | Automatic via GitHub/Render |
| Custom Email | Optional | Extra cost if needed |

**TOTAL: $0 - $15/year**

---

##  Environment Variables

Make sure to generate a strong SYNC_TOKEN:

### Generate Token:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach-Object{[byte](Get-Random -Min 0 -Max 256)}))

# Result example:
# kD8mJx9vLpQwKzN5xYvU2sD4eF1gH6jI9kL0mP3qR5tU8vW
```

### Set in Render:
1. Go to Render dashboard
2. Select your service (stampcoin-api)
3. Go to Environment
4. Add: `SYNC_TOKEN` = your-generated-token

---

##  Quick Action Plan

**If you want to launch TODAY:**
1. GitHub Pages: 1 minute
2. Render Deploy: 5-10 minutes
3. **DONE! ** Website + API live

**If you want custom domain:**
1. Complete above
2. Buy domain: 5 minutes
3. Add DNS records: 5 minutes
4. Wait 24 hours for propagation
5. Domain works!

---

##  Support Links

- **Render Docs**: https://docs.render.com
- **GitHub Pages**: https://docs.github.com/pages
- **Namecheap Support**: https://www.namecheap.com/support
- **Google Domains Help**: https://support.google.com/domains

---

##  Common Issues

### Issue: GitHub Pages shows 404
**Solution**: Wait 2-5 minutes after saving, then refresh

### Issue: Render not starting
**Solution**: Check Logs tab  look for errors

### Issue: API returns 401
**Solution**: Make sure SYNC_TOKEN is set in Render dashboard

### Issue: Domain not working
**Solution**: Wait 24 hours for DNS to propagate, then clear browser cache

### Issue: HTTPS not showing
**Solution**: Wait 24 hours for SSL certificate, then enable "Enforce HTTPS"

---

##  Final Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled (Settings  Pages)
- [ ] Render account created
- [ ] API deployed to Render
- [ ] SYNC_TOKEN set in Render
- [ ] Website accessible: https://zedanazad43.github.io/stp/
- [ ] API responding: https://stampcoin-api.onrender.com/sync
- [ ] (Optional) Domain purchased
- [ ] (Optional) DNS records added
- [ ] (Optional) Domain connected to GitHub Pages
- [ ] (Optional) Domain connected to Render
- [ ] (Optional) HTTPS enabled
- [ ] Everything tested and working!

---

##  You're All Set!

Your complete deployment stack:

**Website**: GitHub Pages (automatic, free, auto-renews)  
**API**: Render (free tier, can sleep)  
**Domain**: Your choice (optional, ~$10/year)  
**Total Cost**: $0-15/year  

**Start now - you'll be live in 10 minutes!** 

---

**Next Step**: Go to https://github.com/zedanazad43/stp/settings/pages and enable GitHub Pages!
