#       | Self-Hosted Runner Quick Start

##    | Quick Start | Schnellstart

###  

####   

```bash
# 1.     
mkdir actions-runner && cd actions-runner

# 2.    ( VERSION  )
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 3.   (  TOKEN    GitHub)
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_REGISTRATION_TOKEN
#    : self-hosted,linux

# 4.  
sudo ./svc.sh install
sudo ./svc.sh start
```

####     (Registration Token)

1.  : https://github.com/zedanazad43/stp/settings/actions/runners
2.   "New self-hosted runner"
3.   `./config.sh`  (  )

####   

```bash
#    
sudo ./svc.sh status

#   
journalctl -u actions.runner.*
```

####    

          
     `self-hosted-ci.yml`  :
   -     main
   -    (Pull Request)  main

    :
   -   (npm ci)
   -   (lint)
   -   (tests)
   -   (build)
   -   Docker ( main )

---

### English 

#### Quick Setup Steps

```bash
# 1. On your server, create runner directory
mkdir actions-runner && cd actions-runner

# 2. Download and install runner (replace VERSION with latest)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 3. Configure runner (get TOKEN from GitHub settings page)
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_REGISTRATION_TOKEN
# When prompted for labels, enter: self-hosted,linux

# 4. Run as service
sudo ./svc.sh install
sudo ./svc.sh start
```

#### Getting the Registration Token

1. Go to: https://github.com/zedanazad43/stp/settings/actions/runners
2. Click "New self-hosted runner"
3. Copy the `./config.sh` command shown (contains the token)

#### Verify It's Running

```bash
# Check service status
sudo ./svc.sh status

# View runner logs
journalctl -u actions.runner.*
```

#### What Happens After Setup?

 Self-hosted runner is now ready and idle  
 The `self-hosted-ci.yml` workflow will automatically run when:
   - Changes are pushed to main branch
   - Pull requests are created targeting main branch

 The workflow will:
   - Install dependencies (npm ci)
   - Run linter checks (lint)
   - Run tests (tests)
   - Build application (build)
   - Build Docker image (on main only)

---

### Deutsch 

#### Schnelle Einrichtungsschritte

```bash
# 1. Auf Ihrem Server, Runner-Verzeichnis erstellen
mkdir actions-runner && cd actions-runner

# 2. Runner herunterladen und installieren (VERSION durch neueste ersetzen)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 3. Runner konfigurieren (TOKEN von GitHub-Einstellungsseite holen)
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_REGISTRATION_TOKEN
# Bei Aufforderung nach Labels eingeben: self-hosted,linux

# 4. Als Dienst ausfuhren
sudo ./svc.sh install
sudo ./svc.sh start
```

#### Registrierungs-Token erhalten

1. Gehe zu: https://github.com/zedanazad43/stp/settings/actions/runners
2. Klicke auf "New self-hosted runner"
3. Kopiere den angezeigten `./config.sh` Befehl (enthalt Token)

#### Uberprufen der Ausfuhrung

```bash
# Dienststatus prufen
sudo ./svc.sh status

# Runner-Logs anzeigen
journalctl -u actions.runner.*
```

#### Was passiert nach der Einrichtung?

 Self-hosted Runner ist jetzt bereit und im Leerlauf  
 Der `self-hosted-ci.yml` Workflow wird automatisch ausgefuhrt bei:
   - Anderungen werden zum main-Branch gepusht
   - Pull-Requests werden fur main-Branch erstellt

 Der Workflow wird:
   - Abhangigkeiten installieren (npm ci)
   - Linter-Prufungen ausfuhren (lint)
   - Tests ausfuhren (tests)
   - Anwendung bauen (build)
   - Docker-Image bauen (nur auf main)

---

##    | Troubleshooting | Fehlerbehebung

###  

**:     GitHub**
```bash
#    
sudo ./svc.sh status
#   
sudo ./svc.sh restart
```

**:   **
-    Node.js 18+ : `node --version`
-    : `journalctl -u actions.runner.* -f`

### English 

**Problem: Runner doesn't appear in GitHub**
```bash
# Check service status
sudo ./svc.sh status
# Restart service
sudo ./svc.sh restart
```

**Problem: Workflow fails**
- Verify Node.js 18+ is installed: `node --version`
- Check runner logs: `journalctl -u actions.runner.* -f`

### Deutsch 

**Problem: Runner erscheint nicht in GitHub**
```bash
# Dienststatus prufen
sudo ./svc.sh status
# Dienst neu starten
sudo ./svc.sh restart
```

**Problem: Workflow schlagt fehl**
- Uberprufen Sie Node.js 18+ Installation: `node --version`
- Runner-Logs prufen: `journalctl -u actions.runner.* -f`

---

##     | More Information | Weitere Informationen

    : `SELF_HOSTED_RUNNER_SETUP.md`  
For detailed instructions, see: `SELF_HOSTED_RUNNER_SETUP.md`  
Fur detaillierte Anweisungen siehe: `SELF_HOSTED_RUNNER_SETUP.md`

---

##    | Security Notes | Sicherheitshinweise

###  
         
        
       

### English 
 Use a limited permission user account to run the runner  
 Keep runner and OS updated regularly  
 Use a firewall to protect the server  

### Deutsch 
 Verwenden Sie ein Benutzerkonto mit eingeschrankten Berechtigungen  
 Halten Sie Runner und OS regelmaig aktuell  
 Verwenden Sie eine Firewall zum Schutz des Servers  
