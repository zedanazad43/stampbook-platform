const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment process...');

// Get environment from command line arguments
const env = process.argv[2] || 'development';

console.log(`Deploying to ${env} environment...`);

// Create necessary directories
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('Created dist directory');
}

// Copy documentation to dist folder
const docsDir = path.join(__dirname, '..', 'docs');
if (fs.existsSync(docsDir)) {
    const targetDir = path.join(distDir, 'docs');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy all files from docs to dist/docs
    fs.readdirSync(docsDir).forEach(file => {
        const srcFile = path.join(docsDir, file);
        const destFile = path.join(targetDir, file);
        if (fs.statSync(srcFile).isFile()) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`Copied ${file} to dist/docs`);
        }
    });
}

// Create index.html if it doesn't exist
const indexFile = path.join(distDir, 'index.html');
if (!fs.existsSync(indexFile)) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stampcoin Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 800px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        h1 {
            color: #667eea;
            font-size: 3em;
            margin-bottom: 20px;
            font-weight: 700;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .description {
            color: #444;
            font-size: 1.1em;
            margin-bottom: 40px;
            line-height: 1.8;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
            text-align: left;
        }
        .feature {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .feature h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1em;
            margin-top: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .languages {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #eee;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Stampcoin Platform</h1>
        <p class="subtitle">منصة رقمية | Digital Platform | Digitale Plattform</p>

        <p class="description">
            An innovative blockchain-based platform for digital stamps, rewards, and loyalty tokens.
            Secure peer-to-peer transfers and a marketplace for digital collectibles.
        </p>

        <div class="features">
            <div class="feature">
                <h3>💳 Digital Wallet</h3>
                <p>Secure storage for your digital stamps and tokens</p>
            </div>
            <div class="feature">
                <h3>🔒 Secure Transfers</h3>
                <p>Blockchain-powered peer-to-peer transactions</p>
            </div>
            <div class="feature">
                <h3>🛍️ Marketplace</h3>
                <p>Buy, sell, and trade digital collectibles</p>
            </div>
            <div class="feature">
                <h3>👤 User Profiles</h3>
                <p>Verified accounts with complete profile management</p>
            </div>
        </div>

        <a href="https://github.com/zedanazad43/stp" class="cta-button">View on GitHub</a>

        <div class="languages">
            <p>🇸🇦 العربية • 🇬🇧 English • 🇩🇪 Deutsch</p>
        </div>
    </div>
</body>
</html>`;
    fs.writeFileSync(indexFile, html);
    console.log('Created index.html');
}

// Build the application
try {
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Application built successfully');
} catch (error) {
    console.error('Error building application:', error);
    process.exit(1);
}

console.log('Deployment completed successfully!');
