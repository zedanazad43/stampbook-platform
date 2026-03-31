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

// ============= التخزين =============
let users = [];
let wallets = [];
let listings = [];
let nfts = [];
let auctions = [];
let stampArchive = [];
let transactions = [];
let watchlist = [];
let ratings = [];
let notifications = [];
let virtualCollections = [];

// ============= التحقق =============
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try {
    req.userId = jwt.verify(token, 'secretkey').id;
    next();
  } catch { res.status(401).json({ error: 'توكن غير صالح' }); }
};

// ============= 1. نظام التقييمات والمراجعات =============
app.post('/api/ratings/add', verifyToken, (req, res) => {
  const { userId, score, comment, itemId } = req.body;
  ratings.push({ id: Date.now(), fromUserId: req.userId, toUserId: userId, score, comment, itemId, createdAt: new Date() });
  res.json({ success: true });
});

app.get('/api/ratings/user/:userId', (req, res) => {
  const userRatings = ratings.filter(r => r.toUserId === req.params.userId);
  const avgScore = userRatings.length ? userRatings.reduce((s, r) => s + r.score, 0) / userRatings.length : 0;
  res.json({ ratings: userRatings, avgScore, count: userRatings.length });
});

// ============= 2. قائمة المراقبة (Watchlist) =============
app.post('/api/watchlist/add', verifyToken, (req, res) => {
  const { itemId, itemType } = req.body;
  if (!watchlist.find(w => w.userId === req.userId && w.itemId === itemId)) {
    watchlist.push({ userId: req.userId, itemId, itemType, addedAt: new Date() });
  }
  res.json({ success: true });
});

app.get('/api/watchlist/my', verifyToken, (req, res) => {
  res.json(watchlist.filter(w => w.userId === req.userId));
});

// ============= 3. إشعارات فورية =============
app.post('/api/notifications/send', verifyToken, (req, res) => {
  const { toUserId, title, message, type } = req.body;
  notifications.push({ id: Date.now(), toUserId, title, message, type, read: false, createdAt: new Date() });
  res.json({ success: true });
});

app.get('/api/notifications/my', verifyToken, (req, res) => {
  res.json(notifications.filter(n => n.toUserId === req.userId));
});

app.post('/api/notifications/mark-read/:id', verifyToken, (req, res) => {
  const notif = notifications.find(n => n.id == req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// ============= 4. مجموعات افتراضية =============
app.post('/api/collections/create', verifyToken, (req, res) => {
  const { name, description, isPublic } = req.body;
  const collection = { id: Date.now().toString(), userId: req.userId, name, description, isPublic, stamps: [], createdAt: new Date() };
  virtualCollections.push(collection);
  res.json(collection);
});

app.post('/api/collections/:id/add-stamp', verifyToken, (req, res) => {
  const collection = virtualCollections.find(c => c.id === req.params.id && c.userId === req.userId);
  if (collection) collection.stamps.push(req.body.stamp);
  res.json({ success: true });
});

app.get('/api/collections/public', (req, res) => {
  res.json(virtualCollections.filter(c => c.isPublic));
});

// ============= 5. أسعار فورية للطوابع (مزودة من API خارجي) =============
app.get('/api/market/prices/live', async (req, res) => {
  // محاكاة أسعار حية من بورصة الطوابع
  const livePrices = [
    { stamp: "Penny Black 1840", price: 4500, change: "+2.3%" },
    { stamp: "Inverted Jenny 1918", price: 125000, change: "+5.1%" },
    { stamp: "Mauritius Post Office 1847", price: 850000, change: "+0.8%" },
    { stamp: "Blue Alexandria 1867", price: 32000, change: "-1.2%" },
    { stamp: "Gold Wheel Berlin 1936", price: 18750, change: "+12.5%" }
  ];
  res.json(livePrices);
});

// ============= 6. دردشة مباشرة بين المستخدمين =============
let chatMessages = [];
app.post('/api/chat/send', verifyToken, (req, res) => {
  const { toUserId, message } = req.body;
  chatMessages.push({ id: Date.now(), fromUserId: req.userId, toUserId, message, timestamp: new Date(), read: false });
  res.json({ success: true });
});

app.get('/api/chat/conversation/:userId', verifyToken, (req, res) => {
  const conv = chatMessages.filter(m => (m.fromUserId === req.userId && m.toUserId === req.params.userId) || (m.fromUserId === req.params.userId && m.toUserId === req.userId));
  res.json(conv);
});

// ============= 7. توصيات ذكية (AI-based recommendations) =============
app.get('/api/recommendations/for-me', verifyToken, (req, res) => {
  // محاكاة توصيات ذكية بناءً على مشاهدات المستخدم
  const recommendations = nfts.filter(n => n.ownerId !== req.userId).slice(0, 6);
  res.json(recommendations);
});

// ============= 8. شهادات ملكية رقمية (NFT Certificates) =============
app.get('/api/certificate/:nftId', (req, res) => {
  const nft = nfts.find(n => n.id === req.params.nftId);
  if (!nft) return res.status(404).json({ error: 'غير موجود' });
  const certificate = {
    nftId: nft.id,
    name: nft.name,
    owner: nft.ownerId,
    mintedAt: nft.mintedAt,
    blockchain: 'Ethereum (EVM-compatible)',
    hash: nft.transactionHash,
    verifyUrl: `https://www.ecostamp.net/verify/${nft.id}`
  };
  res.json(certificate);
});

// ============= 9. نظام العطاءات التلقائية (Auto-bidding) =============
let autoBids = [];
app.post('/api/auctions/auto-bid/set', verifyToken, (req, res) => {
  const { auctionId, maxBid } = req.body;
  autoBids.push({ userId: req.userId, auctionId, maxBid, active: true });
  res.json({ success: true });
});

// ============= 10. معرض ثلاثي الأبعاد للمقتنيات (3D Gallery) =============
app.get('/api/gallery/3d/:collectionId', (req, res) => {
  const collection = virtualCollections.find(c => c.id === req.params.collectionId);
  if (!collection) return res.status(404).json({ error: 'غير موجود' });
  // محاكاة معرض ثلاثي الأبعاد
  res.json({
    collection: collection.name,
    stamps: collection.stamps.map(s => ({
      image: s.imageUrl,
      title: s.name,
      position: { x: Math.random() * 10, y: Math.random() * 5, z: Math.random() * 10 }
    }))
  });
});

// ============= باقي API (Auth, Marketplace, Auctions, NFT, Wallets, Archive, Analytics) =============
// (يتم إضافة نفس الكود السابق هنا)

// ============= التوثيق =============
app.get('/api/auth/register', async (req, res) => { /* كود التسجيل */ });
app.get('/api/auth/login', async (req, res) => { /* كود الدخول */ });
app.get('/api/auth/me', verifyToken, (req, res) => { /* كود المستخدم */ });

// ============= التشغيل =============
app.listen(PORT, () => {
  console.log(`\n🚀 ECOStamp Server v4.0 - 10+ Premium Features`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌐 Live: https://www.ecostamp.net\n`);
});

// ============= 11. نظام النقاط والمكافآت =============
let userPoints = [];

app.post('/api/points/add', verifyToken, (req, res) => {
  const { points, reason } = req.body;
  let userPoint = userPoints.find(u => u.userId === req.userId);
  if (!userPoint) {
    userPoint = { userId: req.userId, points: 0, history: [] };
    userPoints.push(userPoint);
  }
  userPoint.points += points;
  userPoint.history.push({ points, reason, date: new Date() });
  res.json({ newBalance: userPoint.points });
});

app.get('/api/points/my', verifyToken, (req, res) => {
  const userPoint = userPoints.find(u => u.userId === req.userId) || { points: 0, history: [] };
  res.json(userPoint);
});

// مكافآت التسجيل الأول
app.post('/api/auth/register', async (req, res) => {
  // ... كود التسجيل الأصلي ...
  // إضافة 100 نقطة ترحيبية
  userPoints.push({ userId: newUser.id, points: 100, history: [{ points: 100, reason: 'مكافأة ترحيبية', date: new Date() }] });
});
