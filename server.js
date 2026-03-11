'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs/promises');

let Pool;
try {
  // pg is optional at runtime if DATABASE_URL isn't set, but we install it above.
  ({ Pool } = require('pg'));
} catch (_) {
  Pool = null;
}

const app = express();

// --------------------
// Basic middleware
// --------------------
app.disable('x-powered-by');

// JSON + urlencoded form support
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));

// CORS (adjust if needed)
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

// --------------------
// Health
// --------------------
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// --------------------
// Root mode toggle
// --------------------
const ROOT_MODE = String(process.env.ROOT_MODE || 'redirect').toLowerCase();
// If redirect, register GET / before express.static so it overrides public/index.html
if (ROOT_MODE === 'redirect') {
  app.get('/', (req, res) => res.redirect(302, '/contact'));
}

// Extra redirect endpoint (always available)
app.get('/go-contact', (req, res) => res.redirect(302, '/contact'));

// --------------------
// Spam protection (simple, in-memory)
// --------------------
// NOTE: in-memory means per-machine; fine as a basic protection.
const RATE_LIMIT_WINDOW_MS = Number(process.env.CONTACT_RATE_WINDOW_MS || 900000);
const RATE_LIMIT_MAX = Number(process.env.CONTACT_RATE_MAX || 10);
const rateMap = new Map(); // ip => { count, resetAt }

function getClientIp(req) {
  // Fly provides this header
  const flyIp = req.headers['fly-client-ip'];
  if (flyIp) return String(flyIp);
  // fallback
  return req.ip || 'unknown';
}

function rateLimitContact(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();

  const cur = rateMap.get(ip);
  if (!cur || now >= cur.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (cur.count >= RATE_LIMIT_MAX) {
    return res.status(429).send('Too many requests. Please try again later.');
  }

  cur.count += 1;
  return next();
}

// --------------------
// Storage: Postgres preferred, filesystem fallback
// --------------------
const DATABASE_URL = process.env.DATABASE_URL || '';
const CONTACT_MESSAGES_FILE = path.join(__dirname, 'contact-messages.json');

let pgPool = null;
if (DATABASE_URL && Pool) {
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    // Fly Postgres typically requires SSL; pg handles many cases automatically,
    // but if you hit SSL errors, uncomment:
    // ssl: { rejectUnauthorized: false }
  });
}

async function ensureContactTable() {
  if (!pgPool) return;

  const sql = `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      ip TEXT,
      user_agent TEXT
    );
  `;

  await pgPool.query(sql);
}
// ensure table in background (do not block startup)
ensureContactTable().catch(err => {
  console.error('ensureContactTable error:', err && err.message ? err.message : err);
});

async function readContactMessagesFile() {
  try {
    const raw = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e && e.code === 'ENOENT') return [];
    console.error('readContactMessagesFile error:', e && e.message ? e.message : e);
    return [];
  }
}

async function appendContactMessageFile(entry) {
  const existing = await readContactMessagesFile();
  existing.push(entry);
  await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(existing, null, 2), 'utf8');
}

async function storeContactMessage(entry) {
  // Prefer Postgres if configured
  if (pgPool) {
    await pgPool.query(
      INSERT INTO contact_messages (id, name, email, message, created_at, ip, user_agent)
       VALUES (,,,,,,),
      [entry.id, entry.name, entry.email, entry.message, entry.createdAt, entry.ip, entry.userAgent]
    );
    return { backend: 'postgres' };
  }

  // Fallback: local file (may be lost on redeploy/restart)
  await appendContactMessageFile(entry);
  return { backend: 'file' };
}

// --------------------
// Contact page (GET)
// --------------------
app.get('/contact', (req, res) => {
  const contactEmail = process.env.CONTACT_EMAIL || 'stampcoin.contact@gmail.com';
  const repoUrl = process.env.GITHUB_REPO_URL || 'https://github.com/zedanazad43/stp';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Contact | Stampcoin Platform</title>
  <style>
    :root { --bg:#0b1220; --card:#111a2e; --text:#e5e7eb; --muted:#9ca3af; --accent:#60a5fa; }
    body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; background: radial-gradient(1200px 800px at 20% 10%, #1b2a52, var(--bg)); color: var(--text); }
    .wrap { max-width: 860px; margin: 0 auto; padding: 40px 18px; }
    .top { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .card { background: rgba(17,26,46,.92); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
    h1 { margin: 0 0 10px; font-size: 28px; }
    p { margin: 10px 0; color: var(--muted); }
    .grid { display:grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
    @media (min-width: 860px) { .grid { grid-template-columns: 1fr 1fr; } }
    label { display:block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
    input, textarea { width:100%; box-sizing:border-box; padding: 12px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.18); color: var(--text); outline: none; }
    textarea { min-height: 120px; resize: vertical; }
    button { cursor:pointer; padding: 12px 14px; border: 0; border-radius: 12px; background: linear-gradient(90deg, #60a5fa, #a78bfa); color: #0b1220; font-weight: 700; }
    .row { display:flex; gap:12px; flex-wrap:wrap; }
    .pill { display:inline-block; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.18); color: var(--text); font-size: 13px; }
    .hint { font-size: 12px; color: var(--muted); margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <h1>Contact</h1>
        <p>Get in touch with the Stampcoin Platform team.</p>
      </div>
      <div class="row">
        <a class="pill" href="/">Home</a>
        <a class="pill" href="/health">Health</a>
        <a class="pill" href="/go-contact">Redirect test</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2 style="margin:0 0 10px;">Send a message</h2>
        <p>Anti-spam: rate limit + hidden honeypot field.</p>
        <form method="post" action="/contact">
          <!-- Honeypot (bots often fill this) -->
          <div style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">
            <label for="company">Company</label>
            <input id="company" name="company" autocomplete="off" />
          </div>

          <div style="margin-top:12px;">
            <label for="name">Name</label>
            <input id="name" name="name" placeholder="Your name" required />
          </div>
          <div style="margin-top:12px;">
            <label for="email">Email</label>
            <input id="email" name="email" placeholder="you@example.com" type="email" required />
          </div>
          <div style="margin-top:12px;">
            <label for="message">Message</label>
            <textarea id="message" name="message" placeholder="Write your message..." required></textarea>
          </div>
          <div style="margin-top:12px;">
            <button type="submit">Send</button>
          </div>
          <div class="hint">If you submit too many times, you'll get HTTP 429 for a while.</div>
        </form>
      </div>

      <div class="card">
        <h2 style="margin:0 0 10px;">Other contacts</h2>
        <p><strong>Email:</strong> <a href="mailto:"></a></p>
        <p><strong>GitHub:</strong> <a href=""></a></p>
        <p class="hint"><strong>Storage:</strong> .</p>
      </div>
    </div>
  </div>
</body>
</html>);
});

// --------------------
// Contact form (POST)
// --------------------
app.post('/contact', rateLimitContact, async (req, res) => {
  try {
    // Honeypot: if filled, treat as bot and pretend success (do not store)
    const honeypot = (req.body && req.body.company) ? String(req.body.company).trim() : '';
    if (honeypot) {
      return res.status(200).send('OK');
    }

    const name = req.body && req.body.name ? String(req.body.name).trim() : '';
    const email = req.body && req.body.email ? String(req.body.email).trim() : '';
    const message = req.body && req.body.message ? String(req.body.message).trim() : '';

    if (!name || !email || !message) {
      return res.status(400).send('Missing name/email/message');
    }

    const entry = {
      id: 'msg_' + Date.now(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']) : null,
    };

    const result = await storeContactMessage(entry);
    console.log('CONTACT_MESSAGE:', entry, 'stored_in:', result.backend);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Message sent</title>
</head>
<body style="font-family:system-ui;margin:40px;max-width:720px">
  <h1>Message sent</h1>
  <p>Thanks, we received your message.</p>
  <p><a href="/contact">Back to Contact</a> | <a href="/">Home</a></p>
</body>
</html>);
  } catch (e) {
    console.error('POST /contact error:', e);
    return res.status(500).send('Failed to store message');
  }
});

// --------------------
// Static files
// --------------------
app.use(express.static(path.join(__dirname, 'public')));

// --------------------
// Start server
// --------------------
const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => {
  console.log(Stampcoin Platform server listening on port );
});
