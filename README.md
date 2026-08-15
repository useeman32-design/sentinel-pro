# 🛡️ Sentinel AI

**Detect. Protect. Prevent.**

An AI-powered cybersecurity platform protecting Nigeria's digital economy against fraud, phishing, scams, data breaches, identity theft, and cyber threats.

![stack](https://img.shields.io/badge/stack-HTML%20%C2%B7%20CSS%20%C2%B7%20Vanilla%20JS-00FF88) ![type](https://img.shields.io/badge/type-SPA-00C8FF) ![backend](https://img.shields.io/badge/backend-PHP%20%2B%20MySQL%20(planned)-8B98AF)

## ✨ Features

- **Dashboard** — security score ring, threat stats, 4 animated charts, recent scans, tips, live threat news
- **AI Link Scanner** — URL risk analysis with Nigerian brand-impersonation detection
- **Email Phishing Detector** — paste / .eml upload / screenshot tabs
- **SMS Scam Detector** — lottery, bank, investment, WhatsApp & crypto scam signatures
- **QR Scanner** — QRishing detection with decoded destination verification
- **File Scanner** — static analysis verdicts for PDF/DOCX/ZIP/EXE/images
- **Password Checker** — entropy, crack-time estimation, live suggestions (100% local)
- **Breach Monitor** — email exposure lookup with remediation plan
- **Threat Intelligence** — live Nigeria-focused alert feed + charts
- **Reports** — executive summaries with print-to-PDF export
- **Training** — 3 course tracks with progress + certificates
- **AI Security Assistant** — ChatGPT-style UI, Gemini-ready (works offline via built-in KB)
- **Auth** — login, register, verify (OTP UI), forgot & reset password, Google button
- **Notifications, Settings (dark/light, language, API keys), Profile**
- **Super mobile responsive** — bottom tab bar with center quick-scan action, drawer sidebar, safe-area support

## 🚀 Run it

**Dev (PHP built-in server — SQLite auto-created, zero config):**
```bash
php -S 0.0.0.0:3000 router.php
```

**Production (XAMPP):** copy the folder into `htdocs`, create MySQL DB `sentinel_ai` in phpMyAdmin, set credentials in `api/bootstrap.php` — tables migrate + seed automatically on first request. `.htaccess` handles all routing.

**Default super-admin:** `admin@sentinel.ai` / `Admin@1234` — ⚠️ change immediately.

## 📁 Structure

```
├── index.html              # Entry — loads all modules
├── css/styles.css          # Design system (dark/light themes, all components)
├── js/
│   ├── app.js              # State, hash router, app shell (sidebar + bottom nav)
│   ├── components.js       # Icons, logo, toasts, SVG chart engine
│   ├── services/
│   │   ├── api.js          # API layer — placeholder endpoints for the PHP backend
│   │   └── ai.js           # Gemini integration point + offline knowledge base
│   └── views/
│       ├── auth.js         # Login / Register / Forgot / Verify / Reset
│       ├── dashboard.js    # Dashboard
│       ├── scanners.js     # Link · Email · SMS · QR · File · Password · Breach
│       ├── intel.js        # Threat Intelligence · Reports · Training
│       ├── assistant.js    # AI chat
│       └── misc.js         # Notifications · Settings · Profile
└── models/schema.sql       # MySQL models (backend implemented later)
```

## 🔌 Backend contract (planned PHP + MySQL)

All requests flow through `js/services/api.js`. Flip `API.USE_BACKEND = true` once the PHP API is live. Endpoints: `/api/login`, `/api/register`, `/api/link-scan`, `/api/email-scan`, `/api/sms-scan`, `/api/qr-scan`, `/api/file-scan`, `/api/breach-check`, `/api/chat`, `/api/reports`, `/api/threat-intel`, `/api/notifications`. Until then the UI runs on realistic client-side heuristics so every module is demonstrable.

## 🤖 Gemini AI

`js/services/ai.js` is the single AI integration point. Add a key in **Settings → API Keys** for live answers (dev only — in production, proxy through the PHP backend so the key stays server-side).

## 🎨 Brand

`#00FF88` · `#00C8FF` · `#0B1220` · `#111827` — Inter + Poppins — shield & AI-circuitry logo (inline SVG).
