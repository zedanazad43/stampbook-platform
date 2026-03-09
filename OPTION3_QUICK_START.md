# Option 3 Deployment Quick Reference

**Goal:** Deploy stampcoin.com with Website + API + Custom Domain

---

## Pre-Deployment Checklist

- [ ] Repository is public on GitHub
- [ ] CNAME file contains: `stampcoin.com`
- [ ] index.html exists in repository root
- [ ] server.js is ready for deployment
- [ ] package.json has correct scripts

---

## Step 1: GitHub Pages (5 minutes)

**Location:** https://github.com/zedanazad43/stp

1. Click **Settings**  **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)**
5. Click **Save**
6. Wait for Actions to complete (look for green checkmark)
7. Site available at: `https://zedanazad43.github.io/stp`

 **Done:** GitHub Pages enabled

---

## Step 2: Render Deployment (10 minutes)

**Location:** https://render.com

1. Sign up with GitHub (recommended)
2. Click **New +**  **Web Service**
3. Connect GitHub repository: `stp`
4. Configuration:
   - Name: `stampcoin-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or Starter Pro $7/mo)

5. Environment Variables:
   ```
   PORT=8080
   SYNC_TOKEN=use-strong-random-token
   NODE_ENV=production
   ```

6. Wait for deployment (2-5 minutes)
7. Note your service URL: `https://stampcoin-api.onrender.com`

Test API:
```bash
curl https://stampcoin-api.onrender.com/sync
```

 **Done:** API deployed to Render

---

## Step 3: Purchase Domain (10 minutes)

**Location:** Namecheap.com OR Google Domains

### Namecheap:
1. Go to https://www.namecheap.com
2. Search: `stampcoin.com`
3. Add to cart  Checkout
4. Complete payment

### Google Domains:
1. Go to https://domains.google
2. Search: `stampcoin.com`
3. Add to cart  Checkout
4. Complete purchase

**Cost:** $8-12/year

 **Done:** Domain registered

---

## Step 4: Configure DNS (5 minutes)

**Location:** Domain Registrar Dashboard

### A Records (for Website):
Add these 4 records:

| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

### CNAME Record (for API):

| Type | Host | Value |
|------|------|-------|
| CNAME | api | stampcoin-api.onrender.com |

**Instructions for Namecheap:**
1. Dashboard  Manage domain
2. Advanced DNS tab
3. Add records using forms

**Instructions for Google Domains:**
1. Dashboard  your domain
2. DNS tab
3. Add records in "Custom Records" section

 **Done:** DNS configured

---

## Step 5: Update Frontend & Test (15 minutes)

### Update API Endpoint

Edit `index.html` and any other files that call the API:

**Find:**
```javascript
https://stampcoin-api.onrender.com/sync
```

**Replace with:**
```javascript
https://api.stampcoin.com/sync
```

**Commit and push:**
```bash
git add index.html
git commit -m "Update API endpoint to custom domain api.stampcoin.com"
git push origin main
```

GitHub Pages redeploys automatically (1-2 minutes).

### Test Access

1. Website: Open `https://stampcoin.com` in browser
   - Should show your website
   - Should have green padlock (HTTPS)
   - No errors in Console (F12)

2. API: Open DevTools (F12)  Network tab
   - Trigger sync operation
   - Check request to `api.stampcoin.com/sync`
   - Status should be 200 (success)
   - Response: `{"todos":[]}`

3. DNS Check (optional):
   ```bash
   nslookup stampcoin.com
   nslookup api.stampcoin.com
   ```

 **Done:** Testing complete

---

## Verification Checklist

### Website (stampcoin.com)
- [ ] Page loads without errors
- [ ] HTTPS padlock is green
- [ ] No "Connection not private" warnings
- [ ] All assets load (images, CSS, JS)
- [ ] Mobile view works
- [ ] No console errors (F12  Console)

### API (api.stampcoin.com)
- [ ] Responds to requests
- [ ] Status code 200
- [ ] Response time <500ms
- [ ] Can POST data
- [ ] Can GET data
- [ ] SYNC_TOKEN works (if set)

### Domain
- [ ] DNS A records resolve
- [ ] DNS CNAME resolves
- [ ] Both domains load HTTPS
- [ ] No DNS errors

### Integration
- [ ] Frontend can reach API
- [ ] No CORS errors
- [ ] Data sync works
- [ ] Application functions work

---

## DNS Propagation

DNS changes take 15 minutes to 24 hours to fully propagate.

**Instant Check:**
- Use https://mxtoolbox.com/nslookup.aspx
- Enter: `stampcoin.com`
- Should show GitHub IPs

**Wait 24 hours for full propagation before considering it a problem.**

---

## Common Issues & Quick Fixes

### Website shows 404
- [ ] CNAME file correct
- [ ] Check GitHub Actions passed
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Try https://zedanazad43.github.io/stp first

### API not responding
- [ ] Render free tier sleeps - make a request to wake it up
- [ ] Check Render logs for errors
- [ ] Verify environment variables set
- [ ] Upgrade to Starter Pro if needed

### DNS not working
- [ ] Wait up to 24 hours for propagation
- [ ] Clear DNS cache: `ipconfig /flushdns` (Windows)
- [ ] Verify registrar settings
- [ ] Use online checker: whatsmydns.net

### CORS errors in console
- [ ] Update frontend URL to use `api.stampcoin.com`
- [ ] Ensure HTTPS (not HTTP)
- [ ] Check server.js has `cors()` enabled

### SSL certificate issues
- [ ] GitHub Pages: auto-issued, takes 5-10 min
- [ ] Render: auto-issued, takes 5-10 min
- [ ] Clear browser cache
- [ ] Try incognito mode

---

## Production Recommendations

### Performance
- [ ] Enable caching on Render (Settings  Cache)
- [ ] Minify static assets
- [ ] Use CDN for images (optional)
- [ ] Monitor Lighthouse score

### Security
- [ ] Use strong SYNC_TOKEN
- [ ] Enable HTTPS everywhere (auto)
- [ ] Review GitHub Actions permissions
- [ ] Monitor logs for attacks

### Monitoring
- [ ] Set up Render uptime alerts
- [ ] Check logs weekly
- [ ] Monitor response times
- [ ] Test from different locations

### Scaling
- [ ] Upgrade Render if hitting limits
- [ ] Add database for persistence
- [ ] Implement backup strategy
- [ ] Plan for growth

---

## Support Resources

| Resource | URL |
|----------|-----|
| GitHub Pages | https://pages.github.com |
| Render Docs | https://render.com/docs |
| DNS Checker | https://mxtoolbox.com/nslookup.aspx |
| DNS Propagation | https://whatsmydns.net |
| SSL Checker | https://www.sslshopper.com/ssl-checker.html |
| Namecheap Support | https://www.namecheap.com/support/ |
| Google Domains Help | https://support.google.com/domains |

---

## Timeline

| Phase | Time | Status |
|-------|------|--------|
| GitHub Pages | 5 min |  |
| Render Deploy | 10 min |  |
| Domain Purchase | 10 min |  |
| DNS Config | 5 min |  |
| DNS Propagation | 15 min - 24 hrs |  |
| Testing | 10 min |  |
| **Total** | **55 min - 1 day** | |

---

## Success Criteria

 All items checked = Full Production Deployment

- [ ] `https://stampcoin.com` loads with HTTPS
- [ ] `https://api.stampcoin.com` responds with JSON
- [ ] Frontend can sync data to backend
- [ ] All pages accessible and functional
- [ ] No console errors or warnings
- [ ] API response time <500ms
- [ ] DNS fully propagated

---

**Status:** Ready to Deploy

**Next Step:** Follow detailed guide in `OPTION3_DEPLOYMENT_GUIDE.md`

Start with Part 1: Enable GitHub Pages
