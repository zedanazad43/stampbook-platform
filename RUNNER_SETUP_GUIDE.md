#     (Self-Hosted Runner)

## 
         .                    GitHub.

##  
-  Linux (Ubuntu 20.04    )
-  
-    (sudo)  

##  

### 1.      GitHub
1.     : https://github.com/zedanazad43/stp
2.     **Settings**   
3.     **Actions**  **Runners**
4.    **New self-hosted runner**

### 2.    
1.   : **Linux**
2.  : **x64** (   )

### 3.  
1.     :
   ```bash
   mkdir actions-runner && cd actions-runner
   ```
2.      :
   ```bash
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   ```
3.   :
   ```bash
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

### 4.  
1.         GitHub:
   ```bash
   ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
   ```
   -  `YOUR_TOKEN`     GitHub
   -    (labels) : `self-hosted,linux`

### 5.   
1.   :
   ```bash
   sudo ./svc.sh install
   ```
2.  :
   ```bash
   sudo ./svc.sh start
   ```
3.    :
   ```bash
   sudo ./svc.sh status
   ```

### 6.    
1.    GitHub (Settings > Actions > Runners)
2.        "Self-hosted runners"   "online"

##   

### 1.     GitHub
-     (token)    
-     
-        

### 2.   
-    : `sudo ./svc.sh status`
-   : `sudo ./svc.sh restart`
-    : `sudo journalctl -u actions-runner.service`

### 3.     
-     (labels) : `self-hosted,linux`
-            
-   : `sudo journalctl -u actions-runner.service -f`

##  

###  
1.     :
   ```bash
   sudo chown -R root:root /actions-runner
   ```
2.      
3.    :
   ```bash
   cd actions-runner
   sudo ./svc.sh stop
   sudo ./svc.sh uninstall
   sudo ./config.sh remove --token YOUR_TOKEN
   #    3-5
   ```

###  
1.        (CPU, RAM)
2.      
3.        

## 
- [GitHub Self-Hosted Runner Documentation](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
- [GitHub Self-Hosted Runner Installation Guide](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners)
