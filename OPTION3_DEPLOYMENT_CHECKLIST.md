# Option 3 Complete Deployment Checklist

**Goal:** Deploy stampcoin.com with Website + API + Custom Domain  
**Status:** Ready to Execute  
**Timeline:** 50 minutes - 1 day

---

## Pre-Deployment Requirements

Before starting, verify you have:

- [ ] GitHub account with access to `zedanazad43/stp` repository
- [ ] Admin rights to repository settings
- [ ] Render.com account (or ability to create one)
- [ ] Credit card for domain registration ($8-12/year)
- [ ] Access to domain registrar account (after purchase)
- [ ] Browser with DevTools (Chrome, Firefox, Safari, Edge)
- [ ] Command line access (for DNS testing)

---

## Phase 1: GitHub Pages Setup (5 minutes)

**Location:** https://github.com/zedanazad43/stp

### 1.1 Access Settings
- [ ] Go to repository
- [ ] Click "Settings" (top menu)
- [ ] Click "Pages" (left sidebar)

### 1.2 Configure Pages
- [ ] Source: Select "Deploy from a branch"
- [ ] Branch: Select "main"
- [ ] Folder: Select "/ (root)"
- [ ] Click "Save"

### 1.3 Verify Deployment
- [ ] Go to "Actions" tab
- [ ] Find "Deploy to GitHub Pages" workflow
- [ ] Wait for green checkmark ()
- [ ] Should show "deployment successful"

### 1.4 Initial Test
- [ ] Open browser
- [ ] Visit: `https://zedanazad43.github.io/stp`
- [ ] Verify page loads
- [ ] Check content displays

**Result:**
- [ ] GitHub Pages enabled 
- [ ] Website accessible via GitHub URL 

---

## Phase 2: Render API Deployment (10 minutes)

**Location:** https://render.com

### 2.1 Create Account
- [ ] Go to https://render.com
- [ ] Click "Sign up"
- [ ] Choose "Sign up with GitHub" (recommended)
- [ ] Authorize Render access
- [ ] Complete onboarding

### 2.2 Create Web Service
- [ ] Click "New +"
- [ ] Select "Web Service"
- [ ] Connect repository
- [ ] Search for "stp"
- [ ] Click "Connect"

### 2.3 Configure Service
- [ ] Name: `stampcoin-api`
- [ ] Environment: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Region: US (closest to users)
- [ ] Plan: Free (or Starter Pro $7/mo)

### 2.4 Set Environment Variables
- [ ] Click "Environment"
- [ ] Add `PORT=8080`
- [ ] Add `SYNC_TOKEN=your-secure-token-here`
- [ ] Add `NODE_ENV=production`
- [ ] Click "Save changes"

### 2.5 Enable Auto-Deploy
- [ ] Find "Auto-deploy" setting
- [ ] Enable: "Auto-deploy new commits to main"
- [ ] Save

### 2.6 Wait for Deployment
- [ ] Watch deployment logs
- [ ] Wait for "Your service is live" message
- [ ] Deployment takes 2-5 minutes
- [ ] Note the service URL

### 2.7 Verify API
- [ ] Open DevTools (F12)
- [ ] Go to Console
- [ ] Test API:
  ```javascript
  fetch('https://stampcoin-api.onrender.com/sync')
    .then(r => r.json())
    .then(d => console.log(d))
  ```
- [ ] Should show: `{todos: []}`

**Result:**
- [ ] API deployed to Render 
- [ ] Service shows "Live" status 
- [ ] API responds to requests 
- [ ] Service URL noted 

---

## Phase 3: Domain Registration (10 minutes)

**Choose one registrar**

### Option A: Namecheap (Recommended)

- [ ] Go to https://www.namecheap.com
- [ ] Search for: `stampcoin.com`
- [ ] Check availability
- [ ] Add to cart
- [ ] Proceed to checkout
- [ ] Complete payment (around $8.88/year)
- [ ] Confirm purchase email received
- [ ] Log in to dashboard
- [ ] Find `stampcoin.com` in domain list

### Option B: Google Domains

- [ ] Go to https://domains.google
- [ ] Search for: `stampcoin.com`
- [ ] Check availability
- [ ] Add to cart
- [ ] Proceed to checkout
- [ ] Complete payment (around $12/year)
- [ ] Confirm purchase
- [ ] Domain appears in dashboard

### Option C: GoDaddy

- [ ] Go to https://www.godaddy.com
- [ ] Search for: `stampcoin.com`
- [ ] Check availability
- [ ] Add to cart
- [ ] Proceed to checkout
- [ ] Complete payment (around $7.99/year)
- [ ] Confirm purchase
- [ ] Log in to dashboard

**Result:**
- [ ] Domain registered 
- [ ] Domain appears in registrar dashboard 
- [ ] Have access to DNS settings 

---

## Phase 4: DNS Configuration (5 minutes)

**Perform these steps in your registrar's DNS settings**

### 4.1 Navigate to DNS Settings

**Namecheap:**
- [ ] Dashboard  Find domain
- [ ] Click "Manage"
- [ ] Click "Advanced DNS" tab

**Google Domains:**
- [ ] Dashboard  Click domain
- [ ] Click "DNS" (left menu)

**GoDaddy:**
- [ ] Dashboard  Manage domain
- [ ] Click "DNS"

### 4.2 Add A Records (GitHub Pages)

For each IP, add new A record:

**1st A Record:**
- [ ] Type: A Record
- [ ] Host: @ (root)
- [ ] Value: `185.199.108.153`
- [ ] TTL: 3600
- [ ] Save

**2nd A Record:**
- [ ] Type: A Record
- [ ] Host: @
- [ ] Value: `185.199.109.153`
- [ ] TTL: 3600
- [ ] Save

**3rd A Record:**
- [ ] Type: A Record
- [ ] Host: @
- [ ] Value: `185.199.110.153`
- [ ] TTL: 3600
- [ ] Save

**4th A Record:**
- [ ] Type: A Record
- [ ] Host: @
- [ ] Value: `185.199.111.153`
- [ ] TTL: 3600
- [ ] Save

### 4.3 Add CNAME Record (API)

- [ ] Type: CNAME Record
- [ ] Host: `api`
- [ ] Value: `stampcoin-api.onrender.com`
- [ ] TTL: 3600
- [ ] Save

### 4.4 Verify Registrar Shows All Records

Check your DNS management shows:
- [ ] 4 A records for @ pointing to GitHub IPs
- [ ] 1 CNAME record for api pointing to Render
- [ ] All TTL values are 3600
- [ ] All records saved successfully

**Result:**
- [ ] DNS A records configured 
- [ ] DNS CNAME record configured 
- [ ] All records saved in registrar 

---

## Phase 5: DNS Propagation Wait (15 min - 24 hrs)

### 5.1 Immediate Actions

- [ ] Clear browser cache: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete`)
- [ ] Open incognito/private window
- [ ] Start with Phase 6 while waiting

### 5.2 Monitor Propagation (Optional)

Check progress after 15 minutes:

- [ ] Go to https://mxtoolbox.com/nslookup.aspx
- [ ] Search: `stampcoin.com`
- [ ] Should show GitHub IPs listed
- [ ] Go to https://whatsmydns.net
- [ ] Enter: `stampcoin.com`
- [ ] Check status worldwide

### 5.3 Wait for Completion

- [ ] If not all locations show correct IPs, wait
- [ ] Typically complete within 1-4 hours
- [ ] Max wait time: 24 hours
- [ ] Full propagation not required to proceed

---

## Phase 6: Frontend Updates (10 minutes)

### 6.1 Update API Endpoint

**File:** `index.html` (and any other files calling API)

**Find all occurrences of:**
```
stampcoin-api.onrender.com
```

**Replace with:**
```
api.stampcoin.com
```

**Verification:**
- [ ] Searched entire codebase for Render URL
- [ ] All replaced with `api.stampcoin.com`
- [ ] No old URLs remain
- [ ] Used HTTPS in all URLs

### 6.2 Commit and Push

```bash
git add .
git commit -m "Update API endpoint to custom domain api.stampcoin.com"
git push origin main
```

Steps:
- [ ] Changes staged (`git add`)
- [ ] Committed with message
- [ ] Pushed to main branch
- [ ] GitHub Actions triggered

### 6.3 Verify GitHub Pages Rebuild

- [ ] Go to repository Actions tab
- [ ] Find "Deploy to GitHub Pages" workflow
- [ ] Wait for green checkmark (1-2 minutes)
- [ ] Confirm deployment successful

**Result:**
- [ ] Frontend code updated 
- [ ] API endpoint points to custom domain 
- [ ] GitHub Pages redeployed 

---

## Phase 7: Integration Testing (15 minutes)

### 7.1 Test Website Access

**Via Custom Domain:**
- [ ] Open: `https://stampcoin.com`
- [ ] Page loads successfully
- [ ] No 404 error
- [ ] HTTPS padlock visible (green)
- [ ] Content displays correctly
- [ ] No console errors (F12  Console)

**Via GitHub URL (fallback):**
- [ ] Open: `https://zedanazad43.github.io/stp`
- [ ] Page loads (should work always)
- [ ] Confirm same content as custom domain

### 7.2 Test API Access

**From Browser Console:**
- [ ] Open: `https://stampcoin.com`
- [ ] Press F12 (DevTools)
- [ ] Click "Console" tab
- [ ] Type:
  ```javascript
  fetch('https://api.stampcoin.com/sync')
    .then(r => r.json())
    .then(d => console.log(d))
  ```
- [ ] Should show: `{todos: []}`
- [ ] No errors in console

**From Network Tab:**
- [ ] Click "Network" tab in DevTools
- [ ] Reload page
- [ ] Trigger sync operation
- [ ] Look for request to `api.stampcoin.com/sync`
- [ ] Status should be 200
- [ ] Response time shown

### 7.3 Test Full Workflow

- [ ] Create/modify data in application
- [ ] Trigger sync operation
- [ ] No errors in console
- [ ] Check Network tab shows successful request
- [ ] Reload page
- [ ] Verify data persists
- [ ] Check Network shows correct API domain

### 7.4 Verify HTTPS & Security

- [ ] All requests use HTTPS (not HTTP)
- [ ] No mixed content warning
- [ ] Padlock icon is green
- [ ] Click padlock  "Connection is secure"
- [ ] No console security warnings

### 7.5 Check Performance

- [ ] Website load time: <2 seconds
- [ ] API response time: <500ms
- [ ] No slow requests in Network tab
- [ ] All resources load (no failures)

**Result:**
- [ ] Website accessible at custom domain 
- [ ] API responds correctly 
- [ ] Frontend-API integration works 
- [ ] HTTPS active 
- [ ] Performance acceptable 

---

## Phase 8: Validation Testing (10 minutes)

### 8.1 DNS Verification

**Test DNS Resolution:**
```bash
nslookup stampcoin.com
nslookup api.stampcoin.com
```

- [ ] Website resolves to GitHub IP (185.199.108.153 or similar)
- [ ] API resolves to Render domain
- [ ] No NXDOMAIN errors

### 8.2 Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if macOS)
- [ ] Edge (if Windows)

For each:
- [ ] Website loads correctly
- [ ] No console errors
- [ ] Styling intact
- [ ] Functionality works

### 8.3 Responsive Design

Test on multiple sizes:
- [ ] Desktop (DevTools or actual)
- [ ] Tablet
- [ ] Mobile

For each:
- [ ] Layout adapts
- [ ] Text readable
- [ ] Buttons clickable
- [ ] No horizontal scroll

### 8.4 SSL Certificate Validation

- [ ] Open: `https://stampcoin.com`
- [ ] Click padlock icon
- [ ] Click "Certificate"
- [ ] Verify:
  - Issued to: `stampcoin.com`
  - Issued by: Let's Encrypt
  - Valid date in future
  - No warnings

### 8.5 Final URL Tests

- [ ] `https://stampcoin.com`  Loads 
- [ ] `http://stampcoin.com`  Redirects to HTTPS 
- [ ] `https://api.stampcoin.com/sync`  JSON response 
- [ ] `https://zedanazad43.github.io/stp`  Works as backup 

**Result:**
- [ ] DNS verified 
- [ ] Multi-browser compatible 
- [ ] Responsive design confirmed 
- [ ] SSL certificate valid 
- [ ] All URLs working 

---

## Phase 9: Production Checklist

### 9.1 Security Audit

- [ ] No API keys in frontend code
- [ ] SYNC_TOKEN is strong and unique
- [ ] All traffic is HTTPS
- [ ] No sensitive data in responses
- [ ] No hardcoded credentials
- [ ] GitHub repository not exposing secrets

### 9.2 Performance Optimization

- [ ] Website loads in <2 seconds
- [ ] API responds in <500ms
- [ ] No unused assets loaded
- [ ] Images optimized
- [ ] CSS/JS minified (if applicable)

### 9.3 Monitoring Setup

- [ ] Render service configured
- [ ] Logs accessible
- [ ] Auto-deploy enabled
- [ ] Can monitor response times
- [ ] Alert system configured (optional)

### 9.4 Backup & Recovery

- [ ] Repository backed up to GitHub
- [ ] Can rollback to previous commits
- [ ] Data backup strategy identified
- [ ] Recovery procedure documented

### 9.5 Documentation

- [ ] Deployment guide created 
- [ ] Testing guide created 
- [ ] DNS configuration documented 
- [ ] API endpoints documented
- [ ] Environment variables documented

**Result:**
- [ ] Production ready 
- [ ] Security verified 
- [ ] Performance acceptable 
- [ ] Monitoring enabled 
- [ ] Documentation complete 

---

## Post-Deployment (Ongoing)

### Immediate (24 hours)
- [ ] Monitor Render logs for errors
- [ ] Check API response times
- [ ] Verify data sync working
- [ ] Check browser console for issues

### Daily (1st week)
- [ ] Check Render service status
- [ ] Verify DNS still resolving
- [ ] Test sync operation
- [ ] Monitor error logs

### Weekly
- [ ] Review API logs
- [ ] Check performance metrics
- [ ] Monitor storage usage
- [ ] Update dependencies if needed

### Monthly
- [ ] Review security settings
- [ ] Check SSL certificate validity
- [ ] Monitor costs (domain + Render)
- [ ] Plan scaling if needed

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Website shows 404 | Check GitHub Pages enabled, CNAME configured, Actions passed |
| API returns 503 | Render free tier sleeping - wake it up or upgrade |
| CORS errors | Verify frontend URL uses api.stampcoin.com, check HTTPS |
| DNS not resolving | Wait up to 24h, clear cache, verify registrar settings |
| SSL warning | Wait 10 min for cert to issue, clear cache |
| Slow page load | Check Network tab, optimize images, reduce files |

See detailed troubleshooting in: `OPTION3_DEPLOYMENT_GUIDE.md`

---

## Sign-Off

When all phases complete:

```
 Phase 1: GitHub Pages Setup
 Phase 2: Render API Deployment
 Phase 3: Domain Registration
 Phase 4: DNS Configuration
 Phase 5: DNS Propagation
 Phase 6: Frontend Updates
 Phase 7: Integration Testing
 Phase 8: Validation Testing
 Phase 9: Production Checklist
 Post-Deployment Monitoring
```

**STATUS: PRODUCTION DEPLOYMENT COMPLETE**

---

## Next Steps

1. **Monitor (24 hours)**
   - Watch logs
   - Test functionality
   - Check performance

2. **Optimize (1st week)**
   - Analyze usage patterns
   - Optimize assets
   - Fine-tune settings

3. **Scale (Ongoing)**
   - Upgrade if needed
   - Add features
   - Grow user base

---

## Support & Resources

| Resource | URL |
|----------|-----|
| Deployment Guide | OPTION3_DEPLOYMENT_GUIDE.md |
| Quick Start | OPTION3_QUICK_START.md |
| Testing Guide | TESTING_GUIDE.md |
| DNS Guide | DNS_CONFIGURATION_GUIDE.md |
| GitHub Pages | https://pages.github.com |
| Render Docs | https://render.com/docs |

---

**Document Status:** Complete and Ready for Deployment

**Created:** 2024  
**Version:** 1.0

Use this checklist to track progress through each phase.

When stuck, refer to specific guides or troubleshooting sections.

Good luck with your deployment! 
