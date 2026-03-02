#  QUICK START: Render + GitHub Pages + Domain |  

##  30-Second Overview

```
 Website:  GitHub Pages (LIVE NOW)
 Backend:  Render.com (ready in 5 minutes)
 Domain:   Optional (~$10/year for .com)
```

---

##  IMMEDIATE (5-10 Minutes)

### Step 1: Enable GitHub Pages (1 min)

```
1. Go: https://github.com/zedanazad43/stp/settings/pages
2. Deploy from: main branch
3. Click Save
```

 Website Live at: `https://zedanazad43.github.io/stp/`

### Step 2: Deploy to Render (5-10 min)

```
1. Go: https://render.com
2. Sign up with GitHub
3. New  Web Service
4. Connect repo: zedanazad43/stp
5. Name: stampcoin-api
6. Build: npm install
7. Start: npm start
8. Add SYNC_TOKEN environment variable
9. Click Create  Wait 5-10 min
```

 API Live at: `https://stampcoin-api.onrender.com/sync`

### Test It:

```bash
curl -X GET https://stampcoin-api.onrender.com/sync \
  -H "Authorization: Bearer your-token"
```

---

##  OPTIONAL (If You Want Custom Domain)

### Step 3: Buy Domain (5 min, ~$10/year)

```
1. Go: https://namecheap.com
2. Search: stampcoin.com
3. Add to cart
4. Checkout ($8.88 first year)
5. Done!
```

### Step 4: Add DNS Records (5 min)

In your domain registrar (Namecheap/Google/GoDaddy):

```
Record 1:
Type: CNAME
Name: www
Value: zedanazad43.github.io

Record 2:
Type: CNAME
Name: api
Value: stampcoin-api.onrender.com
```

### Step 5: Connect to GitHub Pages (2 min)

```
1. Go: https://github.com/zedanazad43/stp/settings/pages
2. Custom domain: stampcoin.com
3. Click Save
4. Enable: Enforce HTTPS
```

### Result:

```
Website: https://stampcoin.com (+ www subdomain)
API:     https://api.stampcoin.com/sync
```

---

##  Your URLs

### Without Domain:
```
Website:  https://zedanazad43.github.io/stp/
API:      https://stampcoin-api.onrender.com/sync
```

### With Domain (after setup):
```
Website:  https://stampcoin.com
API:      https://api.stampcoin.com/sync
```

---

##  Cost

```
GitHub Pages : FREE
Render API   : FREE (or $7/month for always-on)
Domain       : $8.88/year (Namecheap)

Total        : $0 - $10/year
```

---

##  Full Documentation

- **Complete Checklist**: [COMPLETE_DEPLOYMENT_CHECKLIST.md](COMPLETE_DEPLOYMENT_CHECKLIST.md)
- **Render Setup**: [RENDER_AND_DOMAIN_SETUP.md](RENDER_AND_DOMAIN_SETUP.md)
- **Domain Guide**: [DOMAIN_GUIDE.md](DOMAIN_GUIDE.md)
- **All Guides**: [INDEX.md](INDEX.md)

---

##  Status

| Component | Status | URL |
|-----------|--------|-----|
| Website |  LIVE | https://zedanazad43.github.io/stp/ |
| API |  READY | Deploy to Render now |
| Domain |  OPTIONAL | Buy if you want |

---

**Start now - you'll be live in 10 minutes!** 

Next: Follow [COMPLETE_DEPLOYMENT_CHECKLIST.md](COMPLETE_DEPLOYMENT_CHECKLIST.md)
