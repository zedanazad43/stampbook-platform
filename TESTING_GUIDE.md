# Option 3 Final Testing Guide

Complete procedures for validating your deployment across all components.

---

## Overview

Testing validates that:
1. Website loads correctly
2. API responds properly
3. Frontend can communicate with API
4. Custom domain works
5. HTTPS is secure
6. Performance meets standards

---

## Pre-Testing Checklist

Before starting tests, ensure:

- [ ] GitHub Pages workflow shows green checkmark
- [ ] Render service shows "Live" status
- [ ] Domain registrar shows DNS records
- [ ] At least 15 minutes passed since DNS changes
- [ ] Browser cache cleared

**Clear cache:**
- **Windows/Linux:** `Ctrl+Shift+Del`
- **macOS:** `Cmd+Shift+Delete`

---

## Test 1: Website Accessibility

### 1.1 Test Direct Access

**What we're testing:** Can users reach the website?

**Steps:**

1. Open new browser tab
2. Type: `https://stampcoin.com`
3. Wait for page to load (max 3 seconds)
4. Verify:
   - Page loads successfully
   - No error message
   - Content is visible
   - Layout looks correct

**Expected Result:**
-  Page loads
-  No 404 or connection errors
-  Green padlock visible
-  Content readable

**If fails:**
- Check browser console (F12  Console tab)
- Try `https://zedanazad43.github.io/stp` (GitHub default)
- Check GitHub Pages is enabled
- Verify DNS records exist

### 1.2 Test via Subdomain

**What we're testing:** Does GitHub Pages subdomain work?

**Steps:**

1. Open: `https://zedanazad43.github.io/stp`
2. Verify page loads
3. Compare to custom domain version

**Expected Result:**
-  Both URLs load same content
-  Same styling and layout
-  All assets present

---

## Test 2: HTTPS & SSL Certificate

### 2.1 Check Certificate

**What we're testing:** Is HTTPS configured correctly?

**Steps:**

1. Open `https://stampcoin.com` in browser
2. Click padlock icon (left of URL)
3. Click "Connection is secure" or "Certificate"
4. Verify certificate details:
   - Issued to: `stampcoin.com`
   - Issued by: Let's Encrypt (or similar)
   - Valid date: Future date shown
   - No errors

**Expected Result:**
-  Green padlock
-  "Connection is secure" shown
-  Certificate valid
-  No warnings

**If fails:**
- GitHub Pages cert takes 5-10 min to issue
- Try again in 10 minutes
- Clear browser cache
- Try incognito mode

### 2.2 Test Forced HTTPS

**What we're testing:** Does HTTP redirect to HTTPS?

**Steps:**

1. Type in URL bar: `http://stampcoin.com` (no S)
2. Press Enter
3. Observe URL bar changes to `https://stampcoin.com`
4. Page loads normally

**Expected Result:**
-  Automatically redirected to HTTPS
-  No mixed content warnings
-  Green padlock shown

---

## Test 3: Website Functionality

### 3.1 Test Page Load

**What we're testing:** Do all resources load?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (open DevTools)
3. Click "Network" tab
4. Reload page (F5)
5. Look for all requests
6. Check for red X marks (failures)

**Expected Result:**
-  All files load (status 200)
-  No red X marks
-  No 404 errors
-  Total load time <2 seconds

**Common issues:**
- 404 on CSS/JS: Check file paths
- Mixed HTTP/HTTPS: Update all URLs
- CORS errors: Check API configuration

### 3.2 Test Responsive Design

**What we're testing:** Does site work on mobile?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Click device toggle (top left, looks like phone/tablet)
4. Select "iPhone SE" (375px width)
5. Reload page
6. Verify:
   - Text readable
   - Buttons clickable
   - Layout adjusts
   - No horizontal scroll

**Expected Result:**
-  Readable on mobile
-  Touch targets large enough
-  No overflow
-  Images scale properly

### 3.3 Test Console for Errors

**What we're testing:** Are there JavaScript errors?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Click "Console" tab
4. Look at messages:
   - Red = Error
   - Yellow = Warning
   - Blue = Info

**Expected Result:**
-  No red errors
-  No "Refused to connect" messages
-  No authentication errors
-  Warnings are acceptable

**If error appears:**
- Note exact error message
- Check it's related to API
- See "Test 4" for API troubleshooting

---

## Test 4: API Endpoint

### 4.1 Test API Directly

**What we're testing:** Does API respond?

**Steps - Using Browser:**

1. Open new tab: `https://api.stampcoin.com/sync`
2. Wait for response
3. Should see JSON response:
   ```json
   {"todos":[]}
   ```

**Steps - Using Command Line:**

```bash
# macOS/Linux
curl -X GET https://api.stampcoin.com/sync

# Windows PowerShell
Invoke-WebRequest -Uri "https://api.stampcoin.com/sync"

# Expected output:
# {"todos":[]}
```

**Expected Result:**
-  Response appears instantly
-  Valid JSON shown
-  No HTML error page
-  Status code 200

**If fails - API not responding:**

1. Check Render service status
2. Open Render dashboard
3. Click service
4. Look for "Live" status
5. Check Logs for errors
6. Restart service if needed

### 4.2 Test API Response Time

**What we're testing:** How fast is the API?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Go to Network tab
4. Look for requests to `api.stampcoin.com`
5. Click request
6. Look at "Time" column
7. Total time should be <500ms

**Expected Result:**
-  Response time <500ms
-  No timeouts
-  Consistent response times

**If slow:**
- Render free tier may be sleeping
- Make a request to wake it up
- Upgrade to Starter Pro for production
- Check network in Render logs

### 4.3 Test API with Authentication

**What we're testing:** Does token validation work? (If configured)

**Steps - Without Token:**

```bash
curl -X GET https://api.stampcoin.com/sync

# If auth enabled, response should be:
# {"error":"Unauthorized"}
```

**Steps - With Token:**

```bash
# Replace YOUR-TOKEN with actual SYNC_TOKEN
curl -X GET https://api.stampcoin.com/sync \
  -H "Authorization: Bearer YOUR-TOKEN"

# Response should be:
# {"todos":[]}
```

**Expected Result:**
-  Without token: 401 Unauthorized (if auth enabled)
-  With token: 200 OK with data

---

## Test 5: Frontend-Backend Integration

### 5.1 Test API Call from Frontend

**What we're testing:** Can frontend reach API?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Click "Network" tab
4. Trigger an action that calls API (depends on your app)
5. Look for `/sync` request
6. Verify:
   - Request sent to `api.stampcoin.com`
   - Status code 200
   - Response contains data

**Expected Result:**
-  Request made to `api.stampcoin.com`
-  Status 200 (success)
-  Response contains JSON
-  No CORS errors

**If CORS error appears:**

Error looks like: `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
1. Verify server.js has: `app.use(cors())`
2. Check API URL uses HTTPS
3. Check API URL matches domain exactly
4. Redeploy to Render

### 5.2 Test Data Persistence

**What we're testing:** Does data sync across requests?

**Steps:**

1. Open `https://stampcoin.com`
2. Create/modify data in app
3. Trigger sync (varies by app)
4. Reload page (F5)
5. Verify data still exists

**Expected Result:**
-  Data persists after reload
-  API successfully stored data
-  No sync errors in console

### 5.3 Test Error Handling

**What we're testing:** Does app handle API errors gracefully?

**Steps:**

1. Stop Render service (temporarily)
   - Go to Render dashboard
   - Click service
   - Click "Suspend" button
2. Go to `https://stampcoin.com`
3. Try to trigger sync
4. Check browser console for error handling
5. Restart Render service

**Expected Result:**
-  App shows error message
-  No blank page or hang
-  User can retry
-  App recovers when API comes back

---

## Test 6: Domain & DNS

### 6.1 Test DNS Resolution

**What we're testing:** Do DNS records resolve correctly?

**Steps:**

1. Open command line
2. Test root domain:
   ```bash
   nslookup stampcoin.com
   ```
   Should show one of these IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

3. Test API subdomain:
   ```bash
   nslookup api.stampcoin.com
   ```
   Should show:
   - `stampcoin-api.onrender.com`

**Expected Result:**
-  Website A records resolve
-  API CNAME resolves
-  No NXDOMAIN errors

**If fails:**

1. Check registrar DNS settings
2. Verify all 4 A records exist
3. Verify CNAME exists
4. Wait for propagation (up to 24 hours)
5. Clear local DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   ```

### 6.2 Test DNS Propagation

**What we're testing:** Is DNS fully propagated globally?

**Steps:**

1. Go to https://whatsmydns.net
2. Enter: `stampcoin.com`
3. Scroll to see results worldwide
4. Most locations should show GitHub IPs

**Expected Result:**
-  Most locations show correct IPs
-  All showing same values
-  Completed (100% green)

**If incomplete:**
- Wait more time (max 24 hours)
- Check registrar settings are correct
- Try again in 1 hour

### 6.3 Test Domain Access

**What we're testing:** Can users reach domain from different networks?

**Steps:**

1. Try from home network: Open `https://stampcoin.com`
2. Try from mobile hotspot: Open `https://stampcoin.com`
3. Try from different browser: Safari, Firefox, Chrome
4. Try from incognito mode

**Expected Result:**
-  Loads from all networks
-  Same content everywhere
-  Works on all browsers

---

## Test 7: Performance

### 7.1 Google Lighthouse Score

**What we're testing:** Overall performance and best practices

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Click "Lighthouse" tab (may be under >> menu)
4. Click "Analyze page load"
5. Wait for results (30-60 seconds)
6. Check scores:
   - Performance: Target >85
   - Accessibility: Target >90
   - Best Practices: Target >90
   - SEO: Target >90

**Expected Result:**
-  Most scores >85
-  Green indicators
-  No critical issues listed

**If score low:**
- Reduce unused CSS/JS
- Optimize images
- Enable gzip compression
- Use CDN for assets

### 7.2 Page Load Speed

**What we're testing:** How fast does page load?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Click "Network" tab
4. Reload page (F5)
5. Look at bottom: "X requests | Y bytes | Z seconds"
6. Note the Z seconds value

**Expected Result:**
-  Total load <2 seconds
-  First paint <1 second
-  Interactive <1.5 seconds

**If slow:**
- Check Network tab for slow requests
- Look for large files
- Optimize images
- Minify CSS/JS

### 7.3 API Response Speed

**What we're testing:** How quickly does API respond?

**Steps:**

1. Open `https://stampcoin.com`
2. Press F12 (DevTools)
3. Network tab
4. Trigger sync operation
5. Find `/sync` request
6. Look at "Time" or "Duration"

**Expected Result:**
-  <500ms response time
-  Consistent timing
-  No timeouts

---

## Test 8: Security

### 8.1 Check HTTPS Only

**What we're testing:** Is all traffic encrypted?

**Steps:**

1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Check each request:
   - Protocol should be `https://`
   - Status should be 200, 304 (not 404)
5. Look for any `http://` requests

**Expected Result:**
-  All requests are HTTPS
-  No mixed content warnings
-  No insecure resource warnings

### 8.2 Check Security Headers

**What we're testing:** Does site have security headers?

**Steps:**

1. Open `https://stampcoin.com`
2. DevTools  Network tab
3. Click page request (first one)
4. Click "Response Headers"
5. Look for:
   - `Strict-Transport-Security`
   - `X-Content-Type-Options`
   - `X-Frame-Options`

**Expected Result:**
-  Security headers present
-  No mixed content
-  Content-Type: text/html

### 8.3 Check for Sensitive Data

**What we're testing:** Is sensitive data exposed?

**Steps:**

1. DevTools  Network tab
2. Look through all requests
3. Click each request
4. Check "Response" tab
5. Verify:
   - No passwords visible
   - No API keys visible
   - No personal data exposed
   - No credit card info

**Expected Result:**
-  No sensitive data in responses
-  No hardcoded credentials
-  Tokens use Bearer scheme

---

## Test 9: Browser Compatibility

### 9.1 Test Multiple Browsers

**What we're testing:** Does site work on different browsers?

**Test on:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if macOS)
- [ ] Edge (if Windows)

**Steps for each:**

1. Open `https://stampcoin.com`
2. Verify:
   - Page loads
   - Layout looks correct
   - No console errors
   - Functionality works

**Expected Result:**
-  Works on all modern browsers
-  Consistent appearance
-  No major differences

### 9.2 Test Across Devices

**Test on:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad-size)
- [ ] Mobile (iPhone-size)

**Steps for each:**

1. Use DevTools device emulation
2. Or test on actual device
3. Verify responsive behavior

**Expected Result:**
-  Works on all sizes
-  Text readable
-  Buttons clickable

---

## Test 10: Error Scenarios

### 10.1 Test Network Error

**What we're testing:** How does app handle network issues?

**Steps:**

1. Open DevTools
2. Click Network tab
3. Find network throttle option (settings )
4. Select "Offline"
5. Try to use app
6. Try API call
7. Check error message

**Expected Result:**
-  Graceful error handling
-  User-friendly error message
-  No blank page
-  Can retry

### 10.2 Test API Down

**What we're testing:** Does app survive API failure?

**Steps:**

1. Go to Render dashboard
2. Click service
3. Click "Suspend" (temporarily)
4. Go to `https://stampcoin.com`
5. Try sync operation
6. Verify error handling
7. Resume service

**Expected Result:**
-  Graceful error message
-  App doesn't crash
-  Recovers when API returns

---

## Complete Testing Checklist

### Website Tests
- [ ] Page loads at `stampcoin.com`
- [ ] HTTPS certificate valid
- [ ] All resources load (no 404s)
- [ ] Responsive design works
- [ ] No console errors
- [ ] Content displays correctly

### API Tests
- [ ] API responds at `api.stampcoin.com`
- [ ] Returns valid JSON
- [ ] Response time <500ms
- [ ] Authentication works (if configured)
- [ ] Status codes correct

### Integration Tests
- [ ] Frontend can call API
- [ ] No CORS errors
- [ ] Data persists
- [ ] Full workflow works
- [ ] Error handling works

### Domain Tests
- [ ] DNS A records resolve
- [ ] DNS CNAME resolves
- [ ] Domain accessible globally
- [ ] Works on all networks

### Performance Tests
- [ ] Lighthouse score >85
- [ ] Page load <2 seconds
- [ ] API response <500ms
- [ ] No slow requests

### Security Tests
- [ ] All traffic HTTPS
- [ ] No sensitive data exposed
- [ ] Security headers present
- [ ] No mixed content

### Compatibility Tests
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on mobile
- [ ] Works on tablet

---

## Test Results Summary

| Test Area | Status | Notes |
|-----------|--------|-------|
| Website Loading | / | |
| HTTPS/SSL | / | |
| API Response | / | |
| Integration | / | |
| Domain/DNS | / | |
| Performance | / | |
| Security | / | |
| Compatibility | / | |

---

## Troubleshooting Summary

| Issue | Solution |
|-------|----------|
| 404 error on website | Check GitHub Pages enabled, CNAME configured |
| SSL warning | Wait 10 min for cert, clear cache |
| API 503 error | Render service asleep - upgrade or trigger request |
| CORS error | Update frontend URL, check cors() enabled |
| Slow page load | Check Network tab, optimize images |
| DNS not resolving | Wait 24h, clear DNS cache, check registrar |
| Data not persisting | Check API logs, verify Render has write permissions |

---

## Sign-Off

When all tests pass:

- [ ] All website tests pass
- [ ] All API tests pass
- [ ] Integration complete
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production

**Status: READY FOR PRODUCTION**

Contact: Check GitHub Issues for support
