#   config.sh   

## 
      config.sh       .

##  
-  Linux (Ubuntu 20.04    )
-  
-    (sudo)  
-    GitHub (     )

##  

### 1.      GitHub
1.    : https://github.com/zedanazad43/stp/settings/actions/runners
2.    "New self-hosted runner"
3.   : Linux : x64
4.    (   : `AAB1234567890abcdef1234567890abcdef1234567890abcdef12345678`)

### 2.     
1.      :
   ```bash
   mkdir actions-runner && cd actions-runner
   ```
2.      (Rar$DIa22900.1791.rartemp)   actions-runner 

### 3.   config.sh  
```bash
cd actions-runner
chmod +x config.sh
```

### 4.  config.sh  
```bash
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
```
-  `YOUR_TOKEN`      1
-    (labels) : `self-hosted,linux`

### 5.   
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

### 6.    
1.    GitHub (https://github.com/zedanazad43/stp/settings/actions/runners)
2.        "Self-hosted runners"   "online"

##   

### : "Must not run with sudo"
-   config.sh   sudo
-          :
  ```bash
  RUNNER_ALLOW_RUNASROOT=1 ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
  ```

### : "Dependencies is missing for Dotnet Core 6.0"
-    :
  ```bash
  sudo ./bin/installdependencies.sh
  ```

### :   
-    :
  ```bash
  sudo ./svc.sh status
  ```
-   :
  ```bash
  sudo ./svc.sh restart
  ```
-   :
  ```bash
  sudo journalctl -u actions-runner.service -f
  ```

##  
    :
```bash
cd actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
sudo ./config.sh remove --token YOUR_TOKEN
#    2-5
```

##  
1.        (CPU, RAM)
2.     SSH 
3.    (firewall)  
4.     regel
