#  Render & Custom Domain Setup Guide |   Render  

##  Prerequisites | 

- [x] GitHub account ( )
- [ ] Render account (  render.com)
- [ ] Custom domain ( -   )
- [ ] GitHub repository ( : zedanazad43/stp)

---

##  Step 1: Deploy to Render |  1:   Render

### A.   Render

1.  : https://render.com
2.  **Sign up**  **Sign in with GitHub**
3.   GitHub  
4.   

### B.    

1.   Render   **+ New**
2.  **Web Service**
3.  **Connect a repository**
4.  : `zedanazad43/stp`
5.  **Connect**

### C.  

**   Web Service:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `stampcoin-api` |   |
| **Environment** | `Node` |  |
| **Build Command** | `npm install` |   |
| **Start Command** | `npm start` |   |
| **Plan** | Free or Starter |  |

### D.   

1.   **Environment**
2.  **Add Environment Variable**
3. :

```
Key: SYNC_TOKEN
Value: your-secret-token-here
```

 token  ():
```bash
#  macOS/Linux
openssl rand -base64 32

#  Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach-Object{[byte](Get-Random -Min 0 -Max 256)}))
```

### E. 

1.  **Create Web Service**
2. Render   
3.  5-10 

** API   :**
```
https://stampcoin-api.onrender.com/sync
```

---

##  Step 2: GitHub Pages Configuration |  2:  GitHub Pages

### A.  GitHub Pages

1.   : https://github.com/zedanazad43/stp
2.  **Settings**
3.  **Pages**   
4.  **Source** :
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/(root)`
5.  **Save**

**   :**
```
https://zedanazad43.github.io/stp/
```

### B.   

1.   **Actions**  
2.    workflow  `Deploy to GitHub Pages`
3.    checkmark 

---

##  Step 3: Custom Domain Setup |  3:   

###  A:    

#### 3A.1   (    )

  :
- **Namecheap**: https://www.namecheap.com
- **GoDaddy**: https://www.godaddy.com
- **Google Domains**: https://domains.google
- **Bluehost**: https://www.bluehost.com

****:  `stampcoin.com` (~$10/)

#### 3A.2   DNS

     DNS:

** GitHub Pages ():**

```
Type: CNAME
Name: www ( leave blank)
Value: zedanazad43.github.io
TTL: 3600
```

 (  ):

```
Type: A
IP: 185.199.108.153
IP: 185.199.109.153
IP: 185.199.110.153
IP: 185.199.111.153
```

** Render API ():**

  subdomain  API ( `api.stampcoin.com`):

```
Type: CNAME
Name: api
Value: stampcoin-api.onrender.com
TTL: 3600
```

#### 3A.3    GitHub Pages

1.   : Settings  Pages
2.  **Custom domain** :
   ```
   stampcoin.com
   ( www.stampcoin.com)
   ```
3.  **Save**
4. GitHub    (  )

#### 3A.4  HTTPS

  :

1.   Settings  Pages
2.  **HTTPS**  **Enforce HTTPS**
3.   (    )

---

###  B:   Render  ()

     :

1.  Render dashboard
2.    `stampcoin-api`
3.   URL :
   ```
   https://stampcoin-api.onrender.com
   ```

---

##     | Verification

###  :

```bash
curl -L https://zedanazad43.github.io/stp/
# : https://stampcoin.com (  )
```

###  API:

```bash
curl -X GET https://stampcoin-api.onrender.com/sync \
  -H "Authorization: Bearer your-sync-token" \
  -H "Content-Type: application/json"

#   :
# {"todos":[]}
```

###   :

```javascript
//  console 
fetch('https://stampcoin-api.onrender.com/sync', {
  headers: {
    'Authorization': 'Bearer your-sync-token'
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

---

##  Troubleshooting |  

### : GitHub Pages  404

**:**
1.      
2.    `index.html`   `public/`  
3.  1-2   

### : Render  

**:**
1.   Render dashboard
2.   **Logs**
3.    
4.    `SYNC_TOKEN` 

### : CORS errors  

**:**
-   CORS   `server.js`
-    URL API 
-   slash 

### :    

**:**
1.    DNS (: `nslookup`  `dig`)
2.  24-48   DNS
3.  GitHub Pages      Settings

### : HTTPS  

**:**
1.    **Enforce HTTPS**  GitHub Pages
2.  24     SSL
3.     DNS 

---

##  Final URLs |  

  :

```
Website:     https://zedanazad43.github.io/stp/
             (: https://stampcoin.com   )

API:         https://stampcoin-api.onrender.com
             (: https://api.stampcoin.com   subdomain)

GitHub Repo: https://github.com/zedanazad43/stp
```

---

##  Recommended Domain Registrars |    

| Registrar | Price | Support | Best For |
|-----------|-------|---------|----------|
| **Namecheap** | $8.88/year |  | Cheap & reliable |
| **Google Domains** | $10-15/year |  | Easy setup |
| **GoDaddy** | $10-15/year |  | Popular |
| **Bluehost** | $2.95/year* |  | Promotion |

*renewal price usually higher

---

##  Estimated Costs |  

###   (  ):

```
Render API     : FREE (free tier)
GitHub Pages   : FREE

Total          : $0/month
```

 ****: Render free tier   15   

###   :

```
Render API     : FREE or $7/month (Starter)
GitHub Pages   : FREE
Domain         : $8-15/year (~$1/month)

Total          : $1/month or $7+/month
```

---

##  Next Steps |  

1.    Render ()
2.     Render (5 )
3.   GitHub Pages (1 )
4.   
5.    ()
6.    DNS
7.   

---

##  Checklist

### Render Deployment:
- [ ]  Render 
- [ ]  
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] SYNC_TOKEN 
- [ ]   
- [ ] API : `/sync`

### GitHub Pages:
- [ ] Pages 
- [ ] Branch: `main`
- [ ]    

### Custom Domain ():
- [ ]  
- [ ]  DNS 
- [ ]    GitHub
- [ ] HTTPS 

---

##  Useful Links

**Render Documentation**: https://docs.render.com  
**GitHub Pages Docs**: https://docs.github.com/pages  
**DNS Setup Guide**: https://mxtoolbox.com  
**Namecheap**: https://www.namecheap.com  

---

**   !   Render   5 !** 
