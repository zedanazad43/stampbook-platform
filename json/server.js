const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// إعداد الأمان
app.use(helmet());
app.use(cors());

// تقييد طلبات API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // الحد الأقصى للطلبات لكل IP
});
app.use('/api/', limiter);

// ضغط الاستجابات
app.use(compression());

// تسجيل الطلبات
app.use(morgan('combined'));

// تحليل البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stampcoin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('تم الاتصال بقاعدة البيانات'))
.catch(err => console.error('فشل الاتصال بقاعدة البيانات:', err));

// تعريف المخططات والنماذج
const StampSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  estimatedValue: { type: Number, required: true },
  currency: { type: String, default: 'stp' },
  imageUrl: { type: String },
  nftAddress: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddress: { type: String },
  balance: { type: Number, default: 0 },
  notifications: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // buy, sell, transfer
  amount: { type: Number, required: true },
  currency: { type: String, default: 'stp' },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stamp: { type: mongoose.Schema.Types.ObjectId, ref: 'Stamp' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const InvestmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  minInvestment: { type: Number, required: true },
  maxInvestment: { type: Number, required: true },
  returnRate: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// إنشاء النماذج
const Stamp = mongoose.model('Stamp', StampSchema);
const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const InvestmentPlan = mongoose.model('InvestmentPlan', InvestmentPlanSchema);

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'مرحباً بك في واجهة برمجة تطبيقات منصة ستامكوين' });
});

// API للمحافظ
app.get('/api/wallets', async (req, res) => {
  try {
    const wallets = await User.find({}, 'username email walletAddress balance');
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المحافظ', error: err });
  }
});

app.get('/api/wallets/:userId', async (req, res) => {
  try {
    const wallet = await User.findById(req.params.userId);
    if (!wallet) {
      return res.status(404).json({ message: 'المحفظة غير موجودة' });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المحفظة', error: err });
  }
});

// API للطوابع
app.get('/api/stamps', async (req, res) => {
  try {
    const stamps = await Stamp.find();
    res.json(stamps);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الطوابع', error: err });
  }
});

app.post('/api/stamps', async (req, res) => {
  try {
    const stamp = new Stamp(req.body);
    await stamp.save();
    res.status(201).json(stamp);
  } catch (err) {
    res.status(400).json({ message: 'خطأ في إنشاء الطابع', error: err });
  }
});

// API للمعاملات
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('from to stamp');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المعاملات', error: err });
  }
});

// API للخطط الاستثمارية
app.get('/api/investment-plans', async (req, res) => {
  try {
    const plans = await InvestmentPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الخطط الاستثمارية', error: err });
  }
});

// API للطوابع المشهورة
app.get('/api/famous-stamps', async (req, res) => {
  try {
    const famousStamps = await Stamp.find({ category: 'famous' }).sort('estimatedValue').limit(10);
    res.json(famousStamps);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الطوابع المشهورة', error: err });
  }
});

// بدء الخادم
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`يعمل الخادم على المنفط ${PORT}`);
});
