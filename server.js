import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db = { users: [], nfts: [], auctions: [], transactions: [] };
const dbPath = path.join(__dirname, 'database.json');

if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

app.get('/api/nfts', (req, res) => {
    res.json(db.nfts);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', nfts: db.nfts.length });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Stampbook Server running on http://localhost:${PORT}`);
    console.log(`📊 NFTs available: ${db.nfts.length}\n`);
});
