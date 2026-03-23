# 🚀 دليل الإعداد السريع - الوكيل الذاتي التطوير

## Quick Setup Guide - Self-Evolving AI Agent

---

## الخطوة 1: الحصول على مفاتيح API المجانية (5 دقائق)

### 🆓 Gemini - الأفضل للبداية

1. اذهب إلى: <https://aistudio.google.com/app/apikey>
2. سجّل دخول بحساب Google
3. انقر "Create API Key"
4. انسخ المفتاح → `GEMINI_API_KEY`

- **المجاني:** 60 طلب/دقيقة، سياق 1M token

### 🆓 Groq - أسرع نموذج مجاني في العالم

1. اذهب إلى: <https://console.groq.com>
2. أنشئ حساباً
3. انقر "Create API Key"
4. انسخ المفتاح → `GROQ_API_KEY`

- **المجاني:** LLaMA 3.3 70B، Mixtral، Gemma2

### 🆓 Cohere - ممتاز للعربية

1. اذهب إلى: <https://dashboard.cohere.com>
2. أنشئ حساباً
3. اذهب إلى API Keys
4. انسخ المفتاح → `COHERE_API_KEY`

- **المجاني:** 5 طلبات/دقيقة للاستخدام الشخصي

### 🆓 Hugging Face - آلاف النماذج

1. اذهب إلى: <https://huggingface.co/settings/tokens>
2. أنشئ حساباً
3. انقر "New Token"
4. انسخ المفتاح → `HUGGINGFACE_API_KEY`

---

## الخطوة 2: إعداد الملفات

```powershell
# في PowerShell
cd "C:\Users\azadz\OneDrive\المستندات\agent-system"

# انسخ ملف المتغيرات
Copy-Item .env.example .env

# افتح الملف للتعديل
notepad .env
```

أضف مفاتيحك:

```env
GEMINI_API_KEY=AIzaSy...مفتاحك_هنا
GROQ_API_KEY=gsk_...مفتاحك_هنا
COHERE_API_KEY=...مفتاحك_هنا
HUGGINGFACE_API_KEY=hf_...مفتاحك_هنا
```

---

## الخطوة 3: تثبيت وتشغيل

```powershell
cd "C:\Users\azadz\OneDrive\المستندات\agent-system"

# تثبيت المكتبات
npm install

# تشغيل الوكيل
npm run dev
```

---

## الخطوة 4: تجربة الأوامر

```
🤖 أدخل مهمتك: /providers
→ يعرض قائمة المزودين النشطين

🤖 أدخل مهمتك: اكتب كود Python لقراءة ملف CSV
→ يختار Claude أو Groq تلقائياً للكود

🤖 أدخل مهمتك: ابحث عن أحدث أخبار الذكاء الاصطناعي
→ يستخدم Perplexity للبحث الإنترنت

🤖 أدخل مهمتك: /evolve
→ يشغّل دورة التحسين الذاتي

🤖 أدخل مهمتك: /stats
→ يعرض إحصاءات الأداء
```

---

## إضافة Ollama (نماذج محلية - خصوصية كاملة)

```powershell
# 1. تثبيت Ollama
winget install Ollama.Ollama

# 2. تنزيل نموذج (مثال: LLaMA 3.2)
ollama pull llama3.2

# 3. تفعيل في .env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
```

---

## المزودون المدفوعون (اختياري)

| المزود | التسعير | الرابط |
|--------|---------|--------|
| DeepSeek | $0.28/1M token (أرخص بـ98%) | platform.deepseek.com |
| Mistral | $1-3/1M token + Codestral مجاني | console.mistral.ai |
| Together AI | $0.2/1M token + نماذج مفتوحة | api.together.xyz |
| Perplexity | $1/1M token + بحث الإنترنت | perplexity.ai/settings/api |
| OpenAI | $5-15/1M token | platform.openai.com |
| Anthropic | $3-15/1M token | console.anthropic.com |

---

## البنية التقنية

```
agent-system/
├── src/
│   ├── index.ts          ← واجهة المستخدم التفاعلية
│   ├── orchestrator.ts   ← موزع الذكاء الاصطناعي
│   ├── memory.ts         ← نظام الذاكرة المستمرة
│   ├── self-improver.ts  ← محرك التحسين الذاتي
│   ├── types.ts          ← تعريفات الأنواع
│   └── providers/
│       ├── registry.ts   ← سجل جميع المزودين (12 مزود)
│       └── adapters.ts   ← محولات API (12 محول)
├── memory/               ← ملفات الذاكرة (تُنشأ تلقائياً)
│   ├── short-term.json   ← ذاكرة قصيرة المدى
│   ├── long-term/        ← أرشيف يومي
│   ├── learning-log.jsonl← سجل التعلم
│   └── evolution/        ← سجل التطور الذاتي
├── .env                  ← مفاتيح API (لا تشاركه!)
└── .env.example          ← نموذج الإعداد
```
