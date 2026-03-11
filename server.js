'use strict';

/**
 * Stampcoin Platform - single-file Express server (Fly.io friendly)
 *
 * Fixes:
 * - Removes syntax hazards (no nested template strings for SQL)
 * - Avoids runtime module pitfalls (uses require('fs').promises)
 * - Starts fast and always listens on 0.0.0.0:PORT (Fly expects 8080)
 * - Contact page + POST /contact with:
 *   - spam protection (rate limit + honeypot)
 *   - storage: Postgres if DATABASE_URL is set, otherwise JSON file fallback
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

let Pool = null;
try {
  ({ Pool } = require('pg'));
} catch (e) {
  // pg not installed => will use file fallback
  Pool = null;
}

const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));

// --------------------
// Health
// --------------------
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// --------------------
// Root behavior (toggle)
//   ROOT_MODE=redirect (default) => / redirects to /contact
//   ROOT_MODE=home               => / served by public/index.html (static)
// --------------------
const ROOT_MODE = String(process.env.ROOT_MODE || 'redirect').toLowerCase();
if (ROOT_MODE === 'redirect') {
  app.get('/', (req, res) => res.redirect(302, '/contact'));
}

// Always-available redirect tester
app.get('/go-contact', (req, res) => res.redirect(302, '/contact'));

// --------------------
// Spam protection
// --------------------
const RATE_WINDOW_MS = Number(process.env.CONTACT_RATE_WINDOW_MS || 15 * 60 * 1000); // 15 min
const RATE_MAX = Number(process.env.CONTACT_RATE_MAX || 10);

const rateMap = new Map(); // ip -> {count, resetAt}

function getClientIp(req) {
  return String(req.headers['fly-client-ip'] || req.ip || 'unknown');
}

function rateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();

  const item = rateMap.get(ip);
  if (!item || now >= item.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  if (item.count >= RATE_MAX) {
    return res.status(429).send('Too many requests. Please try again later.');
  }

  item.count += 1;
  return next();
}

// --------------------
// Storage: Postgres (preferred) or JSON file fallback
// --------------------
const DATABASE_URL = process.env.DATABASE_URL ? String(process.env.DATABASE_URL) : '';
const CONTACT_MESSAGES_FILE = path.join(__dirname, 'contact-messages.json');

let pgPool = null;
if (DATABASE_URL && Pool) {
  try {
    pgPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
      ,
      // If you get SSL errors on Fly Postgres, uncomment:
      // ssl: { rejectUnauthorized: false },
    });
  } catch (e) {
    console.error('Failed to init pg pool:', e);
    pgPool = null;
  }
}

async function ensureContactTable() {
  if (!pgPool) return;

  const sql =
    'CREATE TABLE IF NOT EXISTS contact_messages (' +
    'id TEXT PRIMARY KEY,' +
    'name TEXT NOT NULL,' +
    'email TEXT NOT NULL,' +
    'message TEXT NOT NULL,' +
    'created_at TIMESTAMPTZ NOT NULL,' +
    'ip TEXT,' +
    'user_agent TEXT' +
    ');';

  await pgPool.query(sql);
}

// Run in background; never crash app on DB issues
ensureContactTable().catch((e) => {
  console.error('ensureContactTable error:', e && e.message ? e.message : e);
});

async function readMessagesFile() {
  try {
    const raw = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e && e.code === 'ENOENT') return [];
    console.error('readMessagesFile error:', e);
    return [];
  }
}

async function appendMessageFile(entry) {
  const existing = await readMessagesFile();
  existing.push(entry);
  await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(existing, null, 2), 'utf8');
}

async function storeMessage(entry) {
  if (pgPool) {
    await pgPool.query(
      'INSERT INTO contact_messages (id, name, email, message, created_at, ip, user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [entry.id, entry.name, entry.email, entry.message, entry.createdAt, entry.ip, entry.userAgent]
    );
    return 'postgres';
  }

  await appendMessageFile(entry);
  return 'file';
}

// --------------------
// Contact page (GET)
// --------------------
app.get('/contact', (req, res) => {
  const contactEmail = process.env.CONTACT_EMAIL || 'stampcoin.contact@gmail.com';
  const repoUrl = process.env.GITHUB_REPO_URL || 'https://github.com/zedanazad43/stp';
  const storageHint = pgPool ? 'Postgres (DATABASE_URL set)' : 'Local file fallback (no DATABASE_URL)';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
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
          <!-- Honeypot -->
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

          <div class="hint">Storage: ${storageHint}</div>
        </form>
      </div>

      <div class="card">
        <h2 style="margin:0 0 10px;">Other contacts</h2>
        <p><strong>Email:</strong> <a href="mailto:${contactEmail}">${contactEmail}</a></p>
        <p><strong>GitHub:</strong> <a href="${repoUrl}">${repoUrl}</a></p>
      </div>
    </div>
  </div>
</body>
</html>`);
});

// --------------------
// Contact submit (POST)
// --------------------
app.post('/contact', rateLimit, async (req, res) => {
  try {
    // Honeypot check: if filled, silently accept but don't store
    const honeypot = req.body && req.body.company ? String(req.body.company).trim() : '';
    if (honeypot) return res.status(200).send('OK');

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

    let backend = 'unknown';
    try {
      backend = await storeMessage(entry);
    } catch (e) {
      // Never crash; store failures are 500 for this request only
      console.error('storeMessage error:', e && e.message ? e.message : e);
      return res.status(500).send('Failed to store message');
    }

    console.log('CONTACT_MESSAGE:', entry, 'stored_in:', backend);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Message sent</title></head>
<body style="font-family:system-ui;margin:40px;max-width:720px">
  <h1>Message sent</h1>
  <p>Thanks, we received your message.</p>
  <p><a href="/contact">Back to Contact</a> | <a href="/">Home</a></p>
</body></html>`);
  } catch (e) {
    console.error('POST /contact error:', e);
    return res.status(500).send('Server error');
  }
});

// --------------------
// Static
// --------------------
app.use(express.static(path.join(__dirname, 'public')));

// --------------------
// Start (Fly expects 0.0.0.0:8080)
// --------------------
const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => {
  console.log(`Stampcoin Platform server listening on port ${port}`);
});