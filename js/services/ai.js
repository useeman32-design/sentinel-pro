/* ============================================================
   SENTINEL AI — AI Service (Gemini-ready)
   ------------------------------------------------------------
   This module is the single integration point for Google
   Gemini. When a GEMINI_API_KEY is configured (Settings → API
   Keys), requests go to the live model. Until then, a curated
   knowledge base answers common cybersecurity questions so the
   assistant is fully demonstrable offline.

   To go live later:
     1. Obtain an API key from https://aistudio.google.com
     2. Save it in Settings → API Keys (stored locally), OR
        proxy through the PHP backend at POST /api/chat so the
        key never ships to the browser (recommended for prod).
   ============================================================ */

const AI = {
  MODEL: 'gemini-2.0-flash',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',

  SYSTEM_PROMPT: `You are Sentinel AI, an expert cybersecurity assistant protecting Nigeria's digital economy.
You help users with: phishing detection, scam awareness (bank/SMS/WhatsApp/crypto/investment scams common in Nigeria),
password security, safe browsing, data privacy, malware, ransomware, and incident response.
Be concise, practical and non-technical unless asked. When a user may be a fraud victim,
always mention reporting channels: their bank's official fraud line, ngCERT (cert.gov.ng), EFCC (efcc.gov.ng), and NCC.
Never provide instructions for committing cybercrime.`,

  apiKey() { return localStorage.getItem('sentinel_gemini_key') || ''; },

  async chat(message, history = []) {
    const key = AI.apiKey();
    if (key) {
      try {
        const contents = [
          ...history.slice(-10).map(h => ({ role: h.role === 'ai' ? 'model' : 'user', parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: message }] },
        ];
        const res = await fetch(AI.ENDPOINT.replace('{model}', AI.MODEL) + '?key=' + encodeURIComponent(key), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: AI.SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return { reply, source: 'gemini' };
        }
      } catch (e) { /* fall through to local KB */ }
    }
    return { reply: AI.localAnswer(message), source: 'local' };
  },

  localAnswer(q) {
    const s = q.toLowerCase();
    const kb = [
      { re: /(website|link|url).*(safe|check)|is this (website|link|site) safe/, a: `To check if a website is safe:\n\n1. Use the Link Scanner in this app — paste the URL and I'll analyze it.\n2. Check the padlock: the address must start with https://\n3. Read the domain carefully — scammers use lookalikes (gtbank-secure.xyz instead of gtbank.com).\n4. Newly registered domains, free TLDs (.tk, .xyz) and shortened links are red flags.\n5. Never enter your BVN, PIN or OTP on a site you reached from an SMS or WhatsApp link.` },
      { re: /whatsapp.*(secure|protect|hack)/, a: `To secure your WhatsApp:\n\n1. Settings → Account → Two-step verification → enable a PIN.\n2. Never share your 6-digit verification code with ANYONE — that code IS your account.\n3. Beware "vote for my child" or "help me register" links — they steal your code.\n4. Enable fingerprint/Face lock in Privacy settings.\n5. Review Linked Devices regularly and log out any you don't recognize.\n\nIf hijacked: re-register your number in WhatsApp immediately — this kicks out the attacker.` },
      { re: /hacker.*(bank|account)|steal.*bank|bank.*(hack|steal)/, a: `Common ways criminals compromise bank accounts in Nigeria:\n\n1. Phishing SMS/emails pretending to be your bank ("your account will be blocked, verify BVN").\n2. Fake bank websites and USSD prompts that capture your PIN.\n3. SIM swap fraud — hijacking your phone number to receive OTPs.\n4. Malicious loan/betting apps that read your SMS.\n5. Social engineering calls impersonating bank staff.\n\nProtection: never share BVN/PIN/OTP, use the official app only, enable transaction alerts, and set up a SIM lock with your network provider. If compromised, call your bank's fraud line immediately and report to EFCC.` },
      { re: /what is ransomware|ransomware/, a: `Ransomware is malware that encrypts your files and demands payment (usually crypto) to unlock them.\n\nHow it spreads: email attachments, cracked software, malicious ads, and exposed remote desktop connections.\n\nProtection:\n1. Back up important files offline or to cloud storage (3-2-1 rule).\n2. Never open unexpected attachments — even from known contacts.\n3. Keep Windows/apps updated.\n4. Don't install cracked software.\n\nIf infected: disconnect from the network immediately, do NOT pay (payment funds more attacks and rarely guarantees recovery), and report to ngCERT (cert.gov.ng).` },
      { re: /avoid.*phishing|phishing/, a: `How to avoid phishing:\n\n1. Urgency is the #1 red flag — "act within 24 hours" means scam.\n2. Check the sender's actual email address, not just the display name.\n3. Hover over (or long-press) links to preview the real destination before clicking.\n4. Banks NEVER ask for your full BVN, PIN, or OTP via email/SMS/calls.\n5. When in doubt, go directly to the official app or website — never through the message's link.\n6. Use the Email Scanner and Link Scanner in this app to verify suspicious messages.` },
      { re: /(strong|good|secure).*(password)|password.*(strong|tips|secure)/, a: `Strong password rules:\n\n1. Length beats complexity — aim for 14+ characters.\n2. Use a passphrase: "PurpleGoat!Dances@Midnight9" is strong AND memorable.\n3. Never reuse passwords across sites — one breach exposes everything.\n4. Use a password manager (Bitwarden is free) to generate and store unique passwords.\n5. Enable 2FA everywhere, preferably app-based (Google Authenticator) over SMS.\n\nTest any password's strength with the Password Checker in this app — it runs locally, so your password never leaves your device.` },
      { re: /2fa|two.?factor|otp/, a: `Two-Factor Authentication (2FA) adds a second lock to your accounts — even if your password leaks, attackers can't get in.\n\nBest to worst methods:\n1. 🥇 Hardware key (YubiKey)\n2. 🥈 Authenticator app (Google Authenticator, Authy)\n3. 🥉 SMS OTP — better than nothing, but vulnerable to SIM swap\n\nEnable it on: email first (it's the master key to everything), then banking, WhatsApp, and social media.\n\n⚠️ Never share an OTP with anyone — not even someone claiming to be your bank.` },
      { re: /sim swap/, a: `SIM swap fraud is when a criminal takes over your phone number by tricking or bribing telecom agents into transferring it to their SIM. They then receive your OTPs and drain your accounts.\n\nWarning sign: your phone suddenly loses network for an extended period.\n\nProtection:\n1. Set a SIM lock/PIN with your network provider (MTN, Glo, Airtel, 9mobile all support this).\n2. Use app-based 2FA instead of SMS where possible.\n3. Don't publicly share your primary banking phone number.\n\nIf it happens: contact your provider AND your bank immediately to freeze transactions.` },
      { re: /report.*(scam|fraud)|been scammed|i was scammed|victim/, a: `If you've been scammed in Nigeria, act fast:\n\n1. 🏦 Call your bank's fraud desk immediately to freeze/flag transactions (most banks have 24/7 lines).\n2. 📝 Report to EFCC: efcc.gov.ng or visit the nearest office. For cybercrime: report.efcc.gov.ng\n3. 🖥️ Report to ngCERT: cert.gov.ng/report\n4. 📱 Forward scam SMS to 7726 (your network's spam line).\n5. Keep ALL evidence: screenshots, account numbers, phone numbers, receipts.\n\nSpeed matters — banks can sometimes recall transfers if notified within hours.` },
      { re: /vpn/, a: `A VPN encrypts your internet traffic and hides your IP address.\n\nWhen you NEED one: public Wi-Fi (airports, cafés, hotels) — attackers on the same network can intercept unencrypted traffic.\n\nWhen it does NOT help: a VPN won't stop phishing, scams, or malware. It's privacy armor, not a security guard.\n\nAvoid free VPNs — many sell your browsing data, which defeats the purpose. Reputable options: Proton VPN (has a genuine free tier), Mullvad, Windscribe.` },
      { re: /malware|virus/, a: `Malware = malicious software (viruses, trojans, spyware, ransomware).\n\nCommon infection routes in Nigeria:\n1. Cracked software and games\n2. Malicious loan/betting APKs from outside Google Play\n3. Email attachments\n4. "Free airtime/data" apps\n\nProtection:\n1. Install apps ONLY from Google Play / App Store.\n2. Don't use cracked software.\n3. Keep your OS updated.\n4. Use the File Scanner in this app before opening downloads.\n\nSigns of infection: rapid battery drain, data usage spikes, popup ads, unfamiliar apps.` },
    ];
    for (const item of kb) if (item.re.test(s)) return item.a;
    return `I can help you with that. As your security assistant, I cover:\n\n• Checking suspicious links, emails, and SMS (try the scanners in the menu)\n• Password and account security\n• Protecting WhatsApp, banking, and social accounts\n• Understanding threats: phishing, ransomware, SIM swap, malware\n• What to do if you've been scammed\n\nCould you give me a bit more detail about your question?\n\n💡 Tip: connect a Gemini API key in Settings → API Keys to unlock full AI-powered answers.`;
  },
};
