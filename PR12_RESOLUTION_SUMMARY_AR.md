#    PR #12

##  
     (merge conflicts)  PR #12 .  `copilot/resolve-pr-12-merge-conflicts`      .

##    

### 1.   GitHub Actions
      v4:
-  `actions/checkout@v3`  `v4`
-  `actions/setup-node@v3`  `v4`
-  `actions/configure-pages@v3`  `v4`
-  `actions/upload-pages-artifact@v2`  `v4`
-  `actions/deploy-pages@v2`  `v4`

### 2.    main
-        `main`
-    `docs/index.html`  main
-     

### 3.    PR #12
     :
-       (`scripts/generate-landing-page.sh`)
-   GitHub Pages (`pages: write`, `id-token: write`)
-     (concurrency control)
-     npm (`cache: 'npm'`)
-     

### 4.    
-       YAML
-     (code review) -   
-      CodeQL -   
-       

##  

### :
- **`.github/workflows/deploy.yml`** -     
  -     HTML   YAML
  -  v4  
  -       

### :
- **`scripts/generate-landing-page.sh`** -  PR #12
  -      (//)
  -  
  -    API
  
- **`docs/index.html`** -  main
  
- **`PR12_MERGE_RESOLUTION.md`** -   ()

### :
- **`build-and-push.yml`** -    PR #12

##   

  PR #12         :

###  1: Cherry-pick ( )
```bash
git checkout copilot/fix-github-pages-deployment
git cherry-pick dc45938 9817049
git push origin copilot/fix-github-pages-deployment --force
```

###  2: Merge
```bash
git checkout copilot/fix-github-pages-deployment
git merge origin/copilot/resolve-pr-12-merge-conflicts
git push origin copilot/fix-github-pages-deployment --force
```

###  3: PR 
-  PR #12
-  PR   `copilot/resolve-pr-12-merge-conflicts`  `main`

##  

      PR #12:
-  **mergeable**: `true` ( )
-  **mergeable_state**: `clean` ()
-  **rebaseable**: `true` (  )
-      `main`
-     GitHub Actions
-      PR #12

##  

      :
1.      `main` branch
2.      
3.      workflow   
4.       PR #12:
   - GitHub Pages permissions
   - Concurrency control
   - npm caching
   - GitHub Pages deployment actions
   - `scripts/generate-landing-page.sh`

##  

- ** **: `copilot/resolve-pr-12-merge-conflicts`
- ** PR **: `copilot/fix-github-pages-deployment`
- ** **: `main`

##  

 :
1.     `copilot/resolve-pr-12-merge-conflicts`
2.    `copilot/fix-github-pages-deployment`    
3.  PR #12  `main`  

---
****:         .
