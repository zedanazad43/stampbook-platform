#      (Self-Hosted Runner)

##  1:    
1.    : https://github.com/zedanazad43/stp/settings/actions/runners
2.    "New self-hosted runner"
3.   : Linux : x64
4.      3 (   : `AAB1234567890abcdef1234567890abcdef1234567890abcdef12345678`)

##  2:    
1.  SSH       Linux:
   ```bash
   ssh username@your-server-ip
   ```

##  3:   
```bash
mkdir actions-runner && cd actions-runner
```

##  4:  
```bash
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
```

##  5:  
```bash
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

##  6:  
```bash
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
```
-  `YOUR_TOKEN`      1
-    (labels) : `self-hosted,linux`

##  7:   
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

##  8:    
1.    GitHub (https://github.com/zedanazad43/stp/settings/actions/runners)
2.        "Self-hosted runners"   "online"

##   

### : "Error getting API token from config"
1.     
2.     
3.       :
   ```bash
   cd actions-runner
   ```

### :   
1.    :
   ```bash
   sudo ./svc.sh status
   ```
2.   :
   ```bash
   sudo ./svc.sh restart
   ```
3.   :
   ```bash
   sudo journalctl -u actions-runner.service -f
   ```

### :    
1.     (labels) : `self-hosted,linux`
2.         (Node.js, npm, )
3.   :
   ```bash
   sudo journalctl -u actions-runner.service -f
   ```

##  

###   
```bash
cd actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
sudo ./config.sh remove --token YOUR_TOKEN
#    3-7
```

###    
```bash
sudo chown -R root:root /actions-runner
```

###  
1.     SSH 
2.    (firewall)  
3.      
4.     

##   
-  : Linux (Ubuntu 20.04    )
- RAM: 2GB  
-  : 10GB  
- Node.js 18.x   (  )
-   
