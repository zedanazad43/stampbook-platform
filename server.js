const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// تخزين في الذاكرة
let users = [];
let wallets = [];
let listings = [];
let nfts = [];

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try {
    req.userId = jwt.verify(token, 'secretkey').id;
    next();
  } catch { res.status(401).json({ error: 'توكن غير صالح' }); }
};

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) 
      return res.status(400).json({ error: 'البريد مستخدم' });
    const user = { id: Date.now().toString(), name, email, password: await bcrypt.hash(password, 10) };
    users.push(user);
    const token = jwt.sign({ id: user.id }, 'secretkey');
    res.json({ token, user: { id: user.id, name, email } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'بيانات غير صحيحة' });
    const token = jwt.sign({ id: user.id }, 'secretkey');
    res.json({ token, user: { id: user.id, name: user.name, email } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  user ? res.json({ name: user.name, email: user.email }) : res.status(404).json({ error: 'غير موجود' });
});

// Wallets
app.post('/api/wallets/create', verifyToken, (req, res) => {
  const wallet = { id: Date.now().toString(), userId: req.userId, balance: 1000, address: '0x' + Math.random().toString(36).substring(2, 10), createdAt: new Date() };
  wallets.push(wallet);
  res.json(wallet);
});

app.get('/api/wallets/my', verifyToken, (req, res) => {
  res.json(wallets.filter(w => w.userId === req.userId));
});

// Marketplace
app.get('/api/marketplace/listings', (req, res) => res.json(listings));
app.post('/api/marketplace/listings', verifyToken, (req, res) => {
  const listing = { id: Date.now().toString(), ...req.body, sellerId: req.userId };
  listings.push(listing);
  res.json(listing);
});

// NFT
app.get('/api/nft/all', (req, res) => res.json(nfts));
app.post('/api/nft/mint', verifyToken, (req, res) => {
  const nft = { id: 'NFT_' + Date.now(), ...req.body, ownerId: req.userId };
  nfts.push(nft);
  res.json(nft);
});

// Status
app.get('/api/status', (req, res) => res.json({ status: 'online', users: users.length, nfts: nfts.length }));

// Serve frontend
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n Stampbook Server Running!`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Mode: In-Memory Storage\n`);
});
