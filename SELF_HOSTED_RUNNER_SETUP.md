# Self-Hosted Runner Setup |    

##  

###  
      GitHub Actions    .

###  
-  Linux (Ubuntu 20.04    )
- Node.js 18.x   (  )
-    2GB RAM
-   10GB  
-   

###  

1. **   **
   -  https://github.com/zedanazad43/stp/settings/actions/runners
   -   "New self-hosted runner"

2. **   **
   -  : Linux
   - : x64 (  )

3. **   **
   ```bash
   #   
   mkdir actions-runner && cd actions-runner
   
   #     
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   #  
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

4. **  **
   ```bash
   #     GitHub (     )
   ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
   
   #   
   #    : self-hosted,linux
   ```

5. **   **
   ```bash
   #  
   sudo ./svc.sh install
   
   #  
   sudo ./svc.sh start
   
   #   
   sudo ./svc.sh status
   ```

### 
        "Idle" :
https://github.com/zedanazad43/stp/settings/actions/runners

---

## English 

### Overview
This document explains how to set up a self-hosted GitHub Actions runner for this repository.

### Prerequisites
- Linux server (Ubuntu 20.04 or newer recommended)
- Node.js 18.x or newer (required for building the application)
- At least 2GB RAM
- Minimum 10GB disk space
- Stable internet connection

### Installation Steps

1. **Navigate to Repository Settings**
   - Open https://github.com/zedanazad43/stp/settings/actions/runners
   - Click "New self-hosted runner"

2. **Choose Operating System and Architecture**
   - Operating System: Linux
   - Architecture: x64 (or match your server)

3. **Download and Configure the Runner**
   ```bash
   # Create a folder for the runner
   mkdir actions-runner && cd actions-runner
   
   # Download the latest runner version
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   # Extract the installer
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

4. **Configure the Runner**
   ```bash
   # Use the command provided by GitHub (will contain your registration token)
   ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
   
   # Add required labels
   # When prompted for labels, enter: self-hosted,linux
   ```

5. **Run the Runner as a Service**
   ```bash
   # Install the service
   sudo ./svc.sh install
   
   # Start the service
   sudo ./svc.sh start
   
   # Check status
   sudo ./svc.sh status
   ```

### Verification
After installation, verify the runner appears as "Idle" at:
https://github.com/zedanazad43/stp/settings/actions/runners

---

## Deutsch 

### Ubersicht
Dieses Dokument erklart, wie man einen selbst gehosteten GitHub Actions Runner fur dieses Repository einrichtet.

### Voraussetzungen
- Linux-Server (Ubuntu 20.04 oder neuer empfohlen)
- Node.js 18.x oder neuer (erforderlich fur den Anwendungsbau)
- Mindestens 2GB RAM
- Mindestens 10GB Speicherplatz
- Stabile Internetverbindung

### Installationsschritte

1. **Zu den Repository-Einstellungen navigieren**
   - Offnen Sie https://github.com/zedanazad43/stp/settings/actions/runners
   - Klicken Sie auf "New self-hosted runner"

2. **Betriebssystem und Architektur wahlen**
   - Betriebssystem: Linux
   - Architektur: x64 (oder passend zu Ihrem Server)

3. **Runner herunterladen und konfigurieren**
   ```bash
   # Ordner fur den Runner erstellen
   mkdir actions-runner && cd actions-runner
   
   # Neueste Runner-Version herunterladen
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   # Installer extrahieren
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

4. **Runner konfigurieren**
   ```bash
   # Verwenden Sie den von GitHub bereitgestellten Befehl (enthalt Ihr Registrierungs-Token)
   ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
   
   # Erforderliche Labels hinzufugen
   # Bei der Aufforderung nach Labels eingeben: self-hosted,linux
   ```

5. **Runner als Dienst ausfuhren**
   ```bash
   # Dienst installieren
   sudo ./svc.sh install
   
   # Dienst starten
   sudo ./svc.sh start
   
   # Status uberprufen
   sudo ./svc.sh status
   ```

### Uberprufung
Nach der Installation uberprufen Sie, ob der Runner als "Idle" angezeigt wird unter:
https://github.com/zedanazad43/stp/settings/actions/runners

---

## Additional Notes |   | Zusatzliche Hinweise

### Security Considerations |   | Sicherheitsuberlegungen

****:      :
-     
-      
-     

**English**: Important security considerations for self-hosted runners:
- Use limited permission user accounts
- Keep the OS and runner updated regularly
- Use a firewall to protect the server

**Deutsch**: Wichtige Sicherheitsaspekte fur selbst gehostete Runner:
- Verwenden Sie Benutzerkonten mit eingeschrankten Berechtigungen
- Halten Sie das Betriebssystem und den Runner regelmaig aktuell
- Verwenden Sie eine Firewall zum Schutz des Servers

### Workflow Usage |    | Workflow-Nutzung

The self-hosted runner is configured with the label `[self-hosted, linux]` and will automatically pick up jobs from the `self-hosted-ci.yml` workflow.

     `[self-hosted, linux]`       `self-hosted-ci.yml`.

Der selbst gehostete Runner ist mit dem Label `[self-hosted, linux]` konfiguriert und ubernimmt automatisch Jobs aus dem `self-hosted-ci.yml` Workflow.
