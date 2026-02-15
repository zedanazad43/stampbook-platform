# التثبيت / Installation / Installation

## العربية 🇸🇦

### طريقة التثبيت التقليدية
1. تأكد من وجود Python وNode.js
2. استنسخ المشروع:
   ```
   git clone https://github.com/zedanazad43/stp.git
   cd stp
   ```
3. ثبّت المتطلبات:
   ```
   npm install
   pip install -r requirements.txt
   ```

### باستخدام Docker
1. تأكد من تثبيت Docker Desktop وتشغيله
   - Windows: قم بتشغيل Docker Desktop من قائمة ابدأ
   - تحقق من أن Docker يعمل: `docker --version`
2. اسحب صورة Docker:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3. شغّل الحاوية:
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4. افتح المتصفح على: `http://localhost:8080`

**استكشاف الأخطاء**:
- إذا ظهرت رسالة "failed to connect to docker API": تأكد من تشغيل Docker Desktop
- Windows: Docker Desktop يجب أن يكون مفتوحاً وعاملاً في الخلفية

### باستخدام Docker (موصى به)
1. تأكد من تثبيت Docker Desktop وتشغيله
   - Windows: قم بتشغيل Docker Desktop من قائمة ابدأ
   - تحقق من أن Docker يعمل: `docker --version`
2. اسحب صورة Docker:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3. شغّل الحاوية:
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4. افتح المتصفح على: `http://localhost:8080`

**استكشاف الأخطاء**:
- إذا ظهرت رسالة "failed to connect to docker API": تأكد من تشغيل Docker Desktop
- Windows: Docker Desktop يجب أن يكون مفتوحاً وعاملاً في الخلفية

## English 🇬🇧

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

## Deutsch 🇩🇪

### Traditionelle Installation
1. Sorge dafür, dass Python & Node.js installiert sind.
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
   - Windows: Starte Docker Desktop vom Startmenü
   - Überprüfe, dass Docker läuft: `docker --version`
2. Lade das Docker-Image:
   ```
   docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
3. Starte den Container:
   ```
   docker run -p 8080:8080 ghcr.io/zedanazad43/stampcoin-platform:latest
   ```
4. Öffne deinen Browser: `http://localhost:8080`

**Fehlerbehebung**:
- Bei "failed to connect to docker API": Stelle sicher, dass Docker Desktop läuft
- Windows: Docker Desktop muss geöffnet und im Hintergrund aktiv sein
