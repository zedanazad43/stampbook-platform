#  / Installation / Installation

##  

###   
1.    Python Node.js
2.  :
   ```
   git clone https://github.com/zedanazad43/stp.git
   cd stp
   ```
3.  :
   ```
   npm install
   pip install -r requirements.txt
   ```

###  Docker
1.    Docker Desktop 
   - Windows:   Docker Desktop   
   -    Docker : `docker --version`
2.   Docker:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3.  :
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4.   : `http://localhost:8080`

** **:
-    "failed to connect to docker API":    Docker Desktop
- Windows: Docker Desktop       

###  Docker ( )
1.    Docker Desktop 
   - Windows:   Docker Desktop   
   -    Docker : `docker --version`
2.   Docker:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3.  :
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4.   : `http://localhost:8080`

** **:
-    "failed to connect to docker API":    Docker Desktop
- Windows: Docker Desktop       

## English 

### Traditional Installation
1. Ensure Python & Node.js are installed.
2. Clone:
   ```
   git clone https://github.com/zedanazad43/stp.git
   cd stp
   ```
3. Install:
   ```
   npm install
   pip install -r requirements.txt
   ```

### Using Docker (Recommended)
1. Install and start Docker Desktop
   - Windows: Launch Docker Desktop from the Start menu
   - Verify Docker is running: `docker --version`
2. Pull the Docker image:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3. Run the container:
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4. Open your browser to: `http://localhost:8080`

**Troubleshooting**:
- If you see "failed to connect to docker API": Ensure Docker Desktop is running
- Windows: Docker Desktop must be open and running in the background

## Deutsch 

### Traditionelle Installation
1. Sorge dafur, dass Python & Node.js installiert sind.
2. Klonen:
   ```
   git clone https://github.com/zedanazad43/stp.git
   cd stp
   ```
3. Installieren:
   ```
   npm install
   pip install -r requirements.txt
   ```

### Mit Docker (Empfohlen)
1. Installiere und starte Docker Desktop
   - Windows: Starte Docker Desktop vom Startmenu
   - Uberprufe, dass Docker lauft: `docker --version`
2. Lade das Docker-Image:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3. Starte den Container:
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4. Offne deinen Browser: `http://localhost:8080`

**Fehlerbehebung**:
- Bei "failed to connect to docker API": Stelle sicher, dass Docker Desktop lauft
- Windows: Docker Desktop muss geoffnet und im Hintergrund aktiv sein
