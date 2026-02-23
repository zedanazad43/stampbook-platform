# DNS Configuration Guide for ecostamp.net

Complete reference for setting up DNS with your domain registrar.

---

## What is DNS?

DNS (Domain Name System) translates domain names into IP addresses and routes traffic:

```
User types: ecostamp.net
    ↓
DNS lookup
    ↓
Found: 185.199.108.153 (GitHub Pages)
    ↓
Browser connects to GitHub servers
    ↓
Website loads
```

For API subdomain:
```
User code calls: api.ecostamp.net
    ↓
DNS lookup
    ↓
Found: ecostamp.net-api.onrender.com
    ↓
Render resolves to: 45.XX.XX.XX (Render server)
    ↓
API responds
```

---

## DNS Records Overview

### A Record (Address Record)
- Points domain name to IPv4 address
- Used for: `ecostamp.net` → GitHub Pages
- Need 4 records (for redundancy)

### CNAME Record (Canonical Name)
- Points domain to another domain
- Used for: `api.ecostamp.net` → `ecostamp.net-api.onrender.com`
- Cannot be used for root domain (@)

### TTL (Time To Live)
- How long browsers cache the record
- 3600 = 1 hour (good for development)
- 86400 = 24 hours (good for production)

---

## Record Values

### GitHub Pages A Records

These 4 IP addresses route traffic to GitHub's servers:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Why 4 records?**
- Redundancy (if one server down, use another)
- Load balancing
- Better performance

### Render CNAME Record

This points API subdomain to Render:

```
ecostamp.net-api.onrender.com
```

Render automatically routes to their servers.

---

## Setup by Registrar

### Namecheap (Recommended)

**Step 1: Log In**
1. Go to https://www.namecheap.com
2. Click "Sign in" (top right)
3. Enter email and password
4. Click "Dashboard" once logged in

**Step 2: Access Domain Settings**
1. Find `ecostamp.net` in your domains list
2. Click the **Manage** button

**Step 3: Go to DNS Settings**
1. Click **Advanced DNS** tab (left menu)
2. You'll see "Host Records" section

**Step 4: Add A Records for GitHub Pages**

Currently you might see some default records. Add these:

1. **First A Record:**
   - Click **Add New Record**
   - Type: **A Record**
   - Host: **@** (represents root domain)
   - Value: **185.199.108.153**
   - TTL: **3600** (or 1800 for faster updates)
   - Click the **checkmark** button (✓)

2. **Second A Record:**
   - Click **Add New Record**
   - Type: **A Record**
   - Host: **@**
   - Value: **185.199.109.153**
   - TTL: **3600**
   - Click **checkmark** (✓)

3. **Third A Record:**
   - Click **Add New Record**
   - Type: **A Record**
   - Host: **@**
   - Value: **185.199.110.153**
   - TTL: **3600**
   - Click **checkmark** (✓)

4. **Fourth A Record:**
   - Click **Add New Record**
   - Type: **A Record**
   - Host: **@**
   - Value: **185.199.111.153**
   - TTL: **3600**
   - Click **checkmark** (✓)

**Step 5: Add CNAME Record for API Subdomain**

1. Click **Add New Record**
2. Type: **CNAME Record**
3. Host: **api** (this creates api.ecostamp.net)
4. Value: **ecostamp.net-api.onrender.com**
5. TTL: **3600**
6. Click **checkmark** (✓)

**Step 6: Save Changes**
1. Scroll to top
2. You should see a save message
3. Records are saved automatically

**Result in Namecheap:**
```
A      @    185.199.108.153     3600
A      @    185.199.109.153     3600
A      @    185.199.110.153     3600
A      @    185.199.111.153     3600
CNAME  api  ecostamp.net-api.onrender.com  3600
```

---

### Google Domains

**Step 1: Log In**
1. Go to https://domains.google
2. Sign in with your Google account
3. Go to "My domains"

**Step 2: Select Your Domain**
1. Find `ecostamp.net`
2. Click on it

**Step 3: Go to DNS Settings**
1. Click **DNS** in the left menu
2. Scroll down to "Custom records"

**Step 4: Add A Records for GitHub Pages**

Click "Create new record" for each:

1. **First A Record:**
   - DNS record type: **A**
   - Name: Leave empty (represents @)
   - IPv4 address: **185.199.108.153**
   - TTL: Leave as default (usually 3600)
   - Click **Create**

2. **Second A Record:**
   - DNS record type: **A**
   - Name: Leave empty
   - IPv4 address: **185.199.109.153**
   - Click **Create**

3. **Third A Record:**
   - DNS record type: **A**
   - Name: Leave empty
   - IPv4 address: **185.199.110.153**
   - Click **Create**

4. **Fourth A Record:**
   - DNS record type: **A**
   - Name: Leave empty
   - IPv4 address: **185.199.111.153**
   - Click **Create**

**Step 5: Add CNAME Record for API**

1. Click "Create new record"
2. DNS record type: **CNAME**
3. Name: **api**
4. Canonical name: **ecostamp.net-api.onrender.com**
5. TTL: Leave as default
6. Click **Create**

**Result in Google Domains:**
```
A      (empty)  185.199.108.153                3600
A      (empty)  185.199.109.153                3600
A      (empty)  185.199.110.153                3600
A      (empty)  185.199.111.153                3600
CNAME  api      ecostamp.net-api.onrender.com     3600
```

---

### GoDaddy

**Step 1: Log In**
1. Go to https://www.godaddy.com
2. Sign in to your account
3. Go to "My Products"

**Step 2: Manage DNS**
1. Find `ecostamp.net`
2. Click the **>** arrow to expand
3. Click **DNS**

**Step 3: Edit DNS Records**
1. Scroll to "Records" section
2. You might see existing records - you can modify them

**Step 4: Add A Records**

Delete any existing A records first, then add:

1. Click "Add" or edit existing A record
2. Name: Leave empty (or @)
3. Type: **A**
4. Value: **185.199.108.153**
5. TTL: 3600
6. Click **Save**

Repeat for each IP:
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

**Step 5: Add CNAME Record**

1. Click "Add"
2. Name: **api**
3. Type: **CNAME**
4. Value (Points to): **ecostamp.net-api.onrender.com**
5. TTL: 3600
6. Click **Save**

---

### Cloudflare

**Step 1: Log In**
1. Go to https://dash.cloudflare.com
2. Sign in
3. Select your domain (or add if not there)

**Step 2: Go to DNS**
1. Click **DNS** in left menu
2. Select **Records** if not already selected

**Step 3: Add A Records**

1. Click **Add record**
2. Type: **A**
3. Name: **@** (represents ecostamp.net )
4. IPv4 address: **185.199.108.153**
5. TTL: **3600**
6. Click **Save**

Repeat for:
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

**Step 4: Add CNAME Record**

1. Click **Add record**
2. Type: **CNAME**
3. Name: **api** (creates api.stampcoin.com)
4. Target: **ecostamp.net-api.onrender.com**
5. TTL: **3600**
6. Click **Save**

**Step 5: Enable DNS Only**
- Make sure "Proxy status" is **DNS only** (gray cloud icon)
- Not orange cloud (Cloudflare proxy) - that's different

---

## Verification

### Check Your DNS Records

Use command line to verify records are set correctly:

**Check A records (website):**
```bash
nslookup ecostamp.net

# Expected output:
# Server: 8.8.8.8
# Address: 8.8.8.8#53
# Non-authoritative answer:
# Name: stampcoin.com
# Address: 185.199.108.153
```

**Check CNAME record (API):**
```bash
nslookup api.ecostamp.net

# Expected output:
# Server: 8.8.8.8
# Address: 8.8.8.8#53
# Non-authoritative answer:
# api.ecostamp.net canonical name = ecostamp.net-api.onrender.com
```

**Windows users:**
```powershell
nslookup ecostamp.net
nslookup api.ecostamp.net
```

**macOS/Linux users:**
```bash
dig ecostamp.net
dig api.ecostamp.net
```

### Online Verification Tools

Use these websites to check DNS:

1. **MXToolbox**: https://mxtoolbox.com/nslookup.aspx
   - Search: `ecostamp.net`
   - Shows all A records
   - Shows CNAME records
   - Indicates if propagation is complete

2. **What's My DNS**: https://whatsmydns.net
   - Shows DNS propagation worldwide
   - Check from multiple locations
   - Useful for waiting on propagation

3. **Google**: https://dns.google
   - Real-time DNS lookup
   - View all record types

### Visual Verification in Browser

1. Open `https://ecostamp.net`
2. Look for:
   - Green padlock (HTTPS)
   - No "Connection not private" warning
   - Page loads without errors
   - Check DevTools (F12) Network tab

---

## DNS Propagation

DNS changes don't apply instantly. Propagation timeline:

| Time | Status |
|------|--------|
| 0 min | DNS change submitted |
| 15 min | 25% of internet aware |
| 1 hour | 50% of internet aware |
| 4 hours | 75% of internet aware |
| 24 hours | 99% of internet aware (complete) |

**What to do:**
1. Make DNS changes
2. Wait at least 15 minutes
3. Check using online tools
4. If still not working, wait up to 24 hours
5. Clear browser cache: `Ctrl+Shift+Del`
6. Try incognito mode

**If stuck after 24 hours:**
1. Double-check registrar DNS records
2. Verify you're looking at right domain
3. Check GitHub Pages is enabled
4. Verify Render service is running

---

## Common DNS Issues & Fixes

### Issue: "Cannot reach server" / "Connection refused"

**Check:**
1. DNS records exist: `nslookup ecostamp.net`
2. A records point to GitHub IPs
3. CNAME points to Render URL
4. Wait for DNS propagation (up to 24 hours)

**Fix:**
1. Verify registrar shows all 4 A records
2. Verify CNAME is there
3. Check for typos in values
4. Clear DNS cache:
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache`

### Issue: Wrong site loads / Old IP

**Cause:**
- DNS still cached in browser
- Old DNS records still active
- TTL not expired

**Fix:**
1. Clear browser cache: `Ctrl+Shift+Del`
2. Close and reopen browser
3. Try incognito mode
4. Wait for TTL to expire (up to 1 hour)
5. Clear system DNS:
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache`

### Issue: CNAME lookup fails

**Cause:**
- CNAME record not created
- Typo in CNAME value
- Still propagating

**Check:**
```bash
nslookup api.ecostamp.net
# Should show: ecostamp.net-api.onrender.com
```

**Fix:**
1. Verify CNAME in registrar settings
2. Check exact spelling: `ecostamp.net-api.onrender.com`
3. No trailing dots
4. Wait for propagation

### Issue: GitHub Pages still shows 404

**Check:**
1. GitHub Actions workflow passed
2. CNAME file in repository
3. GitHub Pages is enabled in settings
4. Custom domain field shows `ecostamp.net`

**Fix:**
1. Re-add custom domain:
   - Settings → Pages → Custom domain
   - Type: `ecostamp.net`
   - Click Save
2. Trigger rebuild:
   - Go to Actions
   - Select "Deploy to GitHub Pages"
   - Click "Run workflow"

---

## Advanced: Manual DNS Testing

### Test with dig command:

```bash
# Show all DNS records
dig ecostamp.net ANY

# Show specific A records
dig ecostamp.net A

# Show CNAME record
dig api.ecostamp.net

# Test DNS server
dig @8.8.8.8 ecostamp.net

# Trace DNS path
dig +trace ecostamp.net
```

### Windows PowerShell:

```powershell
# Test DNS resolution
Resolve-DnsName ecostamp.net

# Test specific record type
Resolve-DnsName ecostamp.net -Type A
Resolve-DnsName api.ecostamp.net-Type CNAME

# Flush local DNS cache
Clear-DnsClientCache
```

---

## DNS Records Summary

### For stampcoin.com (Website):

| Host | Type | Value | TTL |
|------|------|-------|-----|
| @ | A | 185.199.108.153 | 3600 |
| @ | A | 185.199.109.153 | 3600 |
| @ | A | 185.199.110.153 | 3600 |
| @ | A | 185.199.111.153 | 3600 |

### For api.ecostamp.net (Backend):

| Host | Type | Value | TTL |
|------|------|-------|-----|
| api | CNAME |ecostamp.net-api.onrender.com | 3600 |

---

## Checklist

- [ ] Log in to domain registrar
- [ ] Found Advanced DNS or DNS settings
- [ ] Added all 4 A records for GitHub
- [ ] Added CNAME record for API
- [ ] Verified no typos in values
- [ ] TTL set to 3600 (or default)
- [ ] Saved all changes
- [ ] Waited 15 minutes
- [ ] Tested with nslookup/dig
- [ ] Website loads at ecostamp.net
- [ ] API responds at api.ecostamp.net

---

**DNS Setup Complete**

Ready for: [Step 5 - Final Integration & Testing](OPTION3_DEPLOYMENT_GUIDE.md#part-5-final-integration--testing)
