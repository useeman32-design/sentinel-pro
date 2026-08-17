<?php
/* ============================================================
   SENTINEL AI — Backend bootstrap: config, DB (PDO), helpers
   MySQL-first (XAMPP production), SQLite fallback (dev/demo).
   ============================================================ */
declare(strict_types=1);
error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', '0');

const CFG_DEFAULTS = [
  'mysql' => ['host' => '127.0.0.1', 'db' => 'sentinel_ai', 'user' => 'root', 'pass' => ''],
  'sqlite_path' => __DIR__ . '/data/sentinel.db',
  'token_ttl' => 60 * 60 * 24 * 30, // 30 days
];

/* Local overrides (git-ignored): copy api/config.local.example.php to
   api/config.local.php and edit — survives every git pull untouched. */
function cfg(string $key): mixed {
  static $cfg = null;
  if ($cfg === null) {
    $cfg = CFG_DEFAULTS;
    $local = __DIR__ . '/config.local.php';
    if (file_exists($local)) {
      $over = require $local;
      if (is_array($over)) $cfg = array_replace_recursive($cfg, $over);
    }
  }
  return $cfg[$key];
}

function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $opt = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC];
  try {
    $c = cfg('mysql');
    $pdo = new PDO("mysql:host={$c['host']};dbname={$c['db']};charset=utf8mb4", $c['user'], $c['pass'], $opt);
    $GLOBALS['DB_DRIVER'] = 'mysql';
  } catch (Throwable $e) {
    @mkdir(dirname(cfg('sqlite_path')), 0775, true);
    $pdo = new PDO('sqlite:' . cfg('sqlite_path'), null, null, $opt);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
    $GLOBALS['DB_DRIVER'] = 'sqlite';
  }
  migrate($pdo);
  return $pdo;
}

function migrate(PDO $pdo): void {
  $my = ($GLOBALS['DB_DRIVER'] ?? 'sqlite') === 'mysql';

  // Detect a legacy/foreign schema (e.g. the old models/schema.sql draft was
  // imported manually). Its users table lacks the 'verified' column and would
  // break every query — fail fast with an actionable message.
  if ($my) {
    $hasUsers = $pdo->query("SHOW TABLES LIKE 'users'")->fetch();
    if ($hasUsers) {
      $cols = $pdo->query("SHOW COLUMNS FROM users")->fetchAll(PDO::FETCH_COLUMN);
      if (!in_array('verified', $cols)) {
        throw new RuntimeException(
          "Legacy schema detected in this database (probably an imported models/schema.sql). " .
          "Fix: in phpMyAdmin DROP all tables in 'sentinel_ai' (or drop & recreate the empty database) — " .
          "the backend auto-creates the correct tables on the next request. Do NOT import any .sql file.");
      }
    }
  }

  $id = $my ? 'BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  $now = $my ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : "TEXT DEFAULT (datetime('now'))";
  $tables = [
    "CREATE TABLE IF NOT EXISTS users (id $id, name VARCHAR(120) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'member', plan VARCHAR(20) NOT NULL DEFAULT 'free',
      company VARCHAR(150) DEFAULT '', status VARCHAR(20) NOT NULL DEFAULT 'active', verified INTEGER NOT NULL DEFAULT 0,
      verify_code VARCHAR(10) DEFAULT '', created_at $now)",
    "CREATE TABLE IF NOT EXISTS tokens (id $id, user_id INTEGER NOT NULL, token_hash CHAR(64) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'session', expires_at INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS scans (id $id, user_id INTEGER NOT NULL, type VARCHAR(12) NOT NULL, subject TEXT,
      verdict VARCHAR(10) NOT NULL, risk INTEGER NOT NULL, threat_type VARCHAR(150), explanation TEXT, recommendation TEXT,
      meta TEXT, created_at $now)",
    "CREATE TABLE IF NOT EXISTS signatures (id $id, channel VARCHAR(10) NOT NULL, category VARCHAR(60) NOT NULL,
      pattern TEXT NOT NULL, weight INTEGER NOT NULL DEFAULT 10, enabled INTEGER NOT NULL DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS blocklist (id $id, pattern VARCHAR(255) NOT NULL, type VARCHAR(10) NOT NULL DEFAULT 'domain',
      note VARCHAR(255) DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, created_at $now)",
    "CREATE TABLE IF NOT EXISTS brands (id $id, name VARCHAR(80) NOT NULL, official_domains TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS threat_intel (id $id, level VARCHAR(10) NOT NULL, title VARCHAR(200) NOT NULL,
      descr TEXT NOT NULL, category VARCHAR(60) NOT NULL, region VARCHAR(4) DEFAULT 'NG', detail_json TEXT,
      active INTEGER NOT NULL DEFAULT 1, created_at $now)",
    "CREATE TABLE IF NOT EXISTS notifications (id $id, user_id INTEGER, type VARCHAR(10) NOT NULL DEFAULT 'info',
      title VARCHAR(180) NOT NULL, body TEXT, read_at TEXT, created_at $now)",
    "CREATE TABLE IF NOT EXISTS reports (id $id, user_id INTEGER NOT NULL, ref VARCHAR(20) NOT NULL, title VARCHAR(180),
      risk_level VARCHAR(10), threat_count INTEGER DEFAULT 0, body_json TEXT, created_at $now)",
    "CREATE TABLE IF NOT EXISTS chat_messages (id $id, user_id INTEGER NOT NULL, session_id VARCHAR(30) DEFAULT '',
      role VARCHAR(6) NOT NULL, content TEXT NOT NULL, created_at $now)",
    "CREATE TABLE IF NOT EXISTS breaches (id $id, name VARCHAR(150) NOT NULL, domain VARCHAR(150) DEFAULT '',
      breach_date VARCHAR(12) DEFAULT '', data_types VARCHAR(255) DEFAULT '', records VARCHAR(20) DEFAULT '', verified INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS breach_emails (id $id, email_hash CHAR(64) NOT NULL, breach_id INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS settings (k VARCHAR(60) PRIMARY KEY, v TEXT)",
    "CREATE TABLE IF NOT EXISTS courses (id $id, slug VARCHAR(80) NOT NULL UNIQUE, title VARCHAR(180) NOT NULL,
      level VARCHAR(20) NOT NULL DEFAULT 'beginner', description TEXT, minutes INTEGER DEFAULT 30,
      cover VARCHAR(80) DEFAULT 'green', active INTEGER NOT NULL DEFAULT 1, created_at $now)",
    "CREATE TABLE IF NOT EXISTS lessons (id $id, course_id INTEGER NOT NULL, position INTEGER NOT NULL DEFAULT 1,
      title VARCHAR(180) NOT NULL, body_html TEXT, video_url VARCHAR(255) DEFAULT '')",
    "CREATE TABLE IF NOT EXISTS quiz_questions (id $id, course_id INTEGER NOT NULL, question TEXT NOT NULL,
      options_json TEXT NOT NULL, correct_index INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS course_progress (id $id, user_id INTEGER NOT NULL, course_id INTEGER NOT NULL,
      lessons_done TEXT DEFAULT '[]', quiz_score INTEGER, completed_at TEXT, certificate_ref VARCHAR(40))",
    "CREATE TABLE IF NOT EXISTS posts (id $id, user_id INTEGER NOT NULL, title VARCHAR(200) NOT NULL, body TEXT,
      category VARCHAR(40) DEFAULT 'General', likes INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(12) NOT NULL DEFAULT 'active', created_at $now)",
    "CREATE TABLE IF NOT EXISTS post_likes (id $id, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS comments (id $id, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL,
      status VARCHAR(12) NOT NULL DEFAULT 'active', created_at $now)",
    "CREATE TABLE IF NOT EXISTS post_reports (id $id, post_id INTEGER, comment_id INTEGER, user_id INTEGER NOT NULL,
      reason VARCHAR(255) DEFAULT '', status VARCHAR(12) NOT NULL DEFAULT 'open', created_at $now)",
    "CREATE TABLE IF NOT EXISTS announcements (id $id, title VARCHAR(200) NOT NULL, body TEXT, category VARCHAR(40) DEFAULT 'General',
      level VARCHAR(10) DEFAULT 'info', media_url TEXT DEFAULT '', media_type VARCHAR(10) DEFAULT '',
      frequency VARCHAR(20) NOT NULL DEFAULT 'once', start_at TEXT, end_at TEXT, active INTEGER NOT NULL DEFAULT 1, created_at $now)",
    "CREATE TABLE IF NOT EXISTS announcement_views (id $id, announcement_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      shown_count INTEGER NOT NULL DEFAULT 0, last_shown_at INTEGER DEFAULT 0, dismissed INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS rate_limits (bucket VARCHAR(120) PRIMARY KEY, window_start INTEGER NOT NULL, hits INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS translations (id $id, obj_type VARCHAR(20) NOT NULL, obj_id INTEGER NOT NULL,
      lang VARCHAR(6) NOT NULL, field VARCHAR(30) NOT NULL, content TEXT NOT NULL, created_at $now)",
  ];
  foreach ($tables as $sql) $pdo->exec($sql);
  // column upgrades on existing installs
  try { $pdo->query('SELECT from_admin FROM notifications LIMIT 1'); }
  catch (Throwable $e) { $pdo->exec('ALTER TABLE notifications ADD COLUMN from_admin INTEGER NOT NULL DEFAULT 0'); }
  try { $pdo->query('SELECT state FROM scans LIMIT 1'); }
  catch (Throwable $e) { $pdo->exec("ALTER TABLE scans ADD COLUMN state VARCHAR(40) DEFAULT ''"); }
  seed($pdo);
  seed_v2($pdo);
}

function seed(PDO $pdo): void {
  // idempotent: if a previous seed died midway (e.g. permissions/strict-mode),
  // finish the missing parts instead of leaving the platform half-configured.
  $count = fn(string $t) => (int)$pdo->query("SELECT COUNT(*) c FROM $t")->fetch()['c'];
  if ($count('settings') === 0) {
    $pdo->prepare('INSERT INTO settings(k,v) VALUES(?,?)')->execute(['dev_mode', '1']);
  }
  if ($count('users') > 0) {
    if ($count('signatures') === 0) seed_signatures($pdo);
    return;
  }
  // super admin — CHANGE THIS PASSWORD after first login
  $st = $pdo->prepare("INSERT INTO users(name,email,password_hash,role,plan,verified) VALUES(?,?,?,?,?,1)");
  $st->execute(['Super Admin', 'admin@sentinel.ai', password_hash('Admin@1234', PASSWORD_BCRYPT), 'admin', 'enterprise']);

  seed_signatures($pdo);


  $pdo->prepare("INSERT INTO brands(name,official_domains) VALUES(?,?)")->execute(['Nigerian Banks & Fintech',
    json_encode(['gtbank'=>'gtbank.com','zenith'=>'zenithbank.com','firstbank'=>'firstbanknigeria.com','uba'=>'ubagroup.com',
    'accessbank'=>'accessbankplc.com','opay'=>'opayweb.com','palmpay'=>'palmpay.com','kuda'=>'kuda.com','moniepoint'=>'moniepoint.com',
    'paystack'=>'paystack.com','flutterwave'=>'flutterwave.com','cbn'=>'cbn.gov.ng','nibss'=>'nibss-plc.com.ng'])]);

  $bl = $pdo->prepare("INSERT INTO blocklist(pattern,type,note) VALUES(?,?,?)");
  foreach ([['gtb-secure-login.tk','domain','Known phishing kit'],['cbn-upgrade.tk','domain','Fake CBN campaign'],
            ['qr-pay-verify.xyz','domain','QRishing campaign'],['free-airtime-ng.top','domain','Malware dropper']] as $b) $bl->execute($b);

  $ti = $pdo->prepare("INSERT INTO threat_intel(level,title,descr,category,detail_json) VALUES(?,?,?,?,?)");
  foreach ([
    ['danger','Active: Fake CBN “account upgrade” SMS wave','Mass SMS campaign impersonating the Central Bank of Nigeria directing victims to credential-harvesting pages. Over 12,000 reports this week.','Phishing'],
    ['danger','WhatsApp hijack via fake voting links','Attackers send “vote for my child” links that capture WhatsApp verification codes and take over accounts.','Account Takeover'],
    ['warn','Ponzi platform “AgroYield 400%” trending','Investment scam promising 400% agricultural returns spreading through Telegram and Facebook groups.','Investment Fraud'],
    ['warn','Malicious “Loan App” APKs on 3rd-party stores','Predatory loan apps exfiltrating contacts and photos for blackmail.','Malware'],
    ['info','New Android banking trojan variant detected','Anatsa family added overlay attacks targeting Nigerian mobile banking apps.','Malware'],
  ] as $t) $ti->execute([$t[0],$t[1],$t[2],$t[3],null]);

  $br = $pdo->prepare("INSERT INTO breaches(name,domain,breach_date,data_types,records) VALUES(?,?,?,?,?)");
  foreach ([['Collection #1 Combo List','','2019-01','Email, Password','773M'],
            ['NaijaLoaded Forum Leak','naijaloaded.com.ng','2021-06','Email, Username, IP','2.1M'],
            ['Fintech Aggregator Breach','','2023-11','Email, Phone, Partial card','5.4M']] as $b) $br->execute($b);

}

function seed_signatures(PDO $pdo): void {
  $sig = $pdo->prepare("INSERT INTO signatures(channel,category,pattern,weight) VALUES(?,?,?,?)");
  $rules = [
    ['sms','Bank Scam','/(bvn|acct|account (blocked|suspended)|debit|atm|card.*(block|expire)|kyc|upgrade)/i',26],
    ['sms','Lottery Scam','/(congratulation|won|winner|promo|prize|lucky|draw)/i',24],
    ['sms','Investment Scam','/(invest|profit|return|double your|forex|trading platform|roi)/i',24],
    ['sms','Crypto Scam','/(bitcoin|crypto|usdt|wallet|airdrop|binance)/i',22],
    ['sms','WhatsApp Scam','/(whatsapp|wa\.me|chat me|dm me)/i',16],
    ['sms','Malicious Link','/(http|bit\.ly|tinyurl|cutt\.ly|click)/i',14],
    ['sms','Urgency Pressure','/(urgent|now|today|immediately|last chance|24 ?h)/i',10],
    ['email','False Urgency','/(urgent|immediately|within 24|within 48|act now|final notice|suspended)/i',16],
    ['email','Credential Phish','/(verify your account|confirm your identity|update your (kyc|bvn|details)|re-?activate)/i',20],
    ['email','Sensitive Data Request','/(bvn|nin|atm pin|card number|cvv|otp|one-?time password)/i',26],
    ['email','Suspicious Link Push','/(click (here|the link)|http:\/\/|bit\.ly|tinyurl)/i',12],
    ['email','Generic Greeting','/(dear customer|dear user|dear beneficiary|valued customer)/i',10],
    ['email','Advance-Fee Scam','/(won|winner|lottery|inheritance|million|compensation|grant|fund release)/i',22],
    ['email','Authority Impersonation','/(cbn|central bank|efcc|nnpc|federal government).{0,80}(fee|charge|payment|deposit)/i',24],
    ['url','Phishing Keyword','/(login|verify|secure|account|update|confirm|wallet|airdrop|bonus|giveaway|promo)/i',14],
  ];
  foreach ($rules as $r) $sig->execute($r);
}

function seed_v2(PDO $pdo): void {
  // Signature pack v2 — social engineering & sensitive-data solicitation
  $marker = $pdo->query("SELECT COUNT(*) c FROM signatures WHERE category='Sensitive Data Solicitation'")->fetch()['c'];
  if ((int)$marker === 0) {
    $sig = $pdo->prepare("INSERT INTO signatures(channel,category,pattern,weight) VALUES(?,?,?,?)");
    $v2 = [
      ['email','Sensitive Data Solicitation','/(send|provide|share|give|submit|forward)\\s+(me|us|your|the)?\\s*(credit|debit)?\\s*card/i',34],
      ['email','Sensitive Data Solicitation','/(credit card|debit card|card number|card details|cvv|security code|card pin)/i',30],
      ['email','Sensitive Data Solicitation','/(send|provide|share|give|confirm).{0,50}(password|pin|otp|bvn|nin|account number|login details)/i',32],
      ['email','Account Validation Ruse','/(validate|reactivate|restore|unlock|upgrade)\\s+(your)?\\s*account/i',24],
      ['email','Payment Redirect Fraud','/(new|updated|changed)\\s+(bank|account|payment)\\s+(details|information)/i',26],
      ['email','Job/Grant Scam','/(work from home|weekly salary|no experience|guaranteed (job|income)|registration fee)/i',20],
      ['sms','Sensitive Data Solicitation','/(credit card|card number|cvv|card pin|send.{0,30}(pin|otp|password|bvn))/i',34],
      ['sms','Account Validation Ruse','/(validate|reactivate|unlock|upgrade)\\s+(your)?\\s*(account|wallet|sim)/i',24],
      ['sms','Delivery Scam','/(package|parcel|shipment|delivery).{0,40}(fee|customs|pay|held)/i',22],
      ['url','Login Page Clone','/(signin|log-?in|auth|session|webscr|secure-?update)/i',12],
    ];
    foreach ($v2 as $r) $sig->execute($r);
  }
  // Starter course
  $has = (int)$pdo->query('SELECT COUNT(*) c FROM courses')->fetch()['c'];
  if ($has === 0) {
    $pdo->prepare("INSERT INTO courses(slug,title,level,description,minutes,cover) VALUES(?,?,?,?,?,?)")
        ->execute(['cyber-fundamentals','Cybersecurity Fundamentals','beginner',
          'Passwords, phishing, safe browsing and protecting your phone — the essentials every Nigerian internet user needs.',45,'green']);
    $cid = (int)$pdo->lastInsertId();
    $L = $pdo->prepare("INSERT INTO lessons(course_id,position,title,body_html) VALUES(?,?,?,?)");
    $L->execute([$cid,1,'Why Cybersecurity Matters in Nigeria',
      '<p>Nigeria loses over <b>₦500 billion yearly</b> to cybercrime. Fraudsters target everyday people through SMS, WhatsApp, email and fake websites — not just companies.</p><p>In this course you will learn to recognise the tricks scammers use and build habits that keep your money, identity and accounts safe.</p><ul><li>Phishing &amp; smishing (SMS scams)</li><li>Password hygiene</li><li>Safe mobile banking</li><li>What to do if you are targeted</li></ul>']);
    $L->execute([$cid,2,'Spotting Phishing Messages',
      '<p>Phishing messages share tell-tale signs:</p><ul><li><b>Urgency:</b> \"act within 24 hours or your account will be blocked\"</li><li><b>Generic greeting:</b> \"Dear customer\" instead of your name</li><li><b>Suspicious links:</b> strange domains like gtbank-verify.tk</li><li><b>Requests for secrets:</b> banks NEVER ask for your full BVN, PIN or OTP</li></ul><p>When in doubt: do not click. Open your bank\'s official app instead.</p>']);
    $L->execute([$cid,3,'Building Strong Passwords',
      '<p>Length beats complexity. A 14-character passphrase like <b>PurpleGoat!Dances@Midnight</b> takes centuries to crack; <b>P@ssw0rd1</b> falls in minutes.</p><ul><li>Use a different password for every account</li><li>Use a password manager (Bitwarden is free)</li><li>Turn on two-factor authentication everywhere — app-based beats SMS</li></ul>']);
    $L->execute([$cid,4,'Securing Your Phone & Bank Apps',
      '<p>Your phone is your bank branch. Protect it:</p><ul><li>Set a SIM PIN with your network to block SIM-swap fraud</li><li>Install apps only from Google Play / App Store</li><li>Never grant Accessibility permission to random apps</li><li>Enable transaction alerts and biometric login</li></ul><p>If your phone is stolen: block your SIM and bank apps FIRST, before anything else.</p>']);
    $Q = $pdo->prepare("INSERT INTO quiz_questions(course_id,question,options_json,correct_index) VALUES(?,?,?,?)");
    $Q->execute([$cid,'Your \"bank\" sends an SMS asking you to confirm your BVN and OTP via a link. What do you do?',
      json_encode(['Click quickly before the account is blocked','Reply with the details','Ignore/delete — banks never ask for BVN/OTP by SMS','Forward it to friends to check']),2]);
    $Q->execute([$cid,'Which password is strongest?',
      json_encode(['P@ss123','MyDogFred2020','Turquoise-Hippo-Eats-42-Mangoes!','qwerty2024']),2]);
    $Q->execute([$cid,'What is the FIRST thing to do if your phone with banking apps is stolen?',
      json_encode(['Buy a new phone','Post about it online','Block your SIM and freeze banking apps','Wait to see if it is returned']),2]);
  }
}

/* ---------------- helpers ---------------- */
function respond(mixed $data, int $code = 200): never {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}
function input(): array {
  $raw = file_get_contents('php://input');
  $j = json_decode($raw ?: '[]', true);
  return is_array($j) ? $j : [];
}
function setting(string $k, ?string $default = null): ?string {
  $st = db()->prepare('SELECT v FROM settings WHERE k=?'); $st->execute([$k]);
  $r = $st->fetch(); return $r ? $r['v'] : $default;
}
function set_setting(string $k, string $v): void {
  $sql = ($GLOBALS['DB_DRIVER'] === 'mysql')
    ? 'INSERT INTO settings(k,v) VALUES(?,?) ON DUPLICATE KEY UPDATE v=VALUES(v)'
    : 'INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v';
  db()->prepare($sql)->execute([$k, $v]);
}
function bearer(): ?string {
  // 1) custom header — immune to Apache's Authorization stripping
  $x = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
  if ($x) return trim($x);
  // 2) Authorization header in every location Apache might put it
  $h = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? '';
  if (!$h && function_exists('apache_request_headers')) {
    foreach (apache_request_headers() as $k => $v)
      if (strcasecmp($k, 'Authorization') === 0) { $h = $v; break; }
  }
  return preg_match('/Bearer\s+(\S+)/i', $h, $m) ? $m[1] : null;
}
function auth_user(): ?array {
  $t = bearer(); if (!$t) return null;
  $st = db()->prepare("SELECT u.* FROM tokens tk JOIN users u ON u.id=tk.user_id
    WHERE tk.token_hash=? AND tk.type='session' AND tk.expires_at>?");
  $st->execute([hash('sha256', $t), time()]);
  $u = $st->fetch();
  return ($u && $u['status'] === 'active') ? $u : null;
}
function require_auth(): array {
  $u = auth_user(); if (!$u) respond(['error' => 'Unauthorized'], 401);
  return $u;
}
function require_admin(): array {
  $u = require_auth(); if ($u['role'] !== 'admin') respond(['error' => 'Forbidden'], 403);
  return $u;
}
function issue_token(int $uid): string {
  $t = bin2hex(random_bytes(32));
  db()->prepare("INSERT INTO tokens(user_id,token_hash,type,expires_at) VALUES(?,?,'session',?)")
     ->execute([$uid, hash('sha256', $t), time() + cfg('token_ttl')]);
  return $t;
}
function public_user(array $u): array {
  return ['id'=>(int)$u['id'],'name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role'],
          'plan'=>$u['plan'],'company'=>$u['company'],'verified'=>(int)$u['verified'],'status'=>$u['status']];
}
function notify(?int $uid, string $type, string $title, string $body): void {
  db()->prepare('INSERT INTO notifications(user_id,type,title,body) VALUES(?,?,?,?)')->execute([$uid,$type,$title,$body]);
}

/* ---- rate limiting (fixed window) ---- */
function rate_limit(string $action, string $ident, int $max, int $windowSec): void {
  $bucket = $action . ':' . substr(hash('sha256', $ident), 0, 32);
  $now = time();
  $pdo = db();
  $st = $pdo->prepare('SELECT window_start, hits FROM rate_limits WHERE bucket=?');
  $st->execute([$bucket]);
  $row = $st->fetch();
  if (!$row || $now - (int)$row['window_start'] >= $windowSec) {
    $sql = ($GLOBALS['DB_DRIVER'] === 'mysql')
      ? 'INSERT INTO rate_limits(bucket,window_start,hits) VALUES(?,?,1) ON DUPLICATE KEY UPDATE window_start=VALUES(window_start), hits=1'
      : 'INSERT INTO rate_limits(bucket,window_start,hits) VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET window_start=excluded.window_start, hits=1';
    $pdo->prepare($sql)->execute([$bucket, $now]);
    return;
  }
  if ((int)$row['hits'] >= $max) {
    $wait = $windowSec - ($now - (int)$row['window_start']);
    respond(['error' => "Too many attempts. Try again in {$wait}s."], 429);
  }
  $pdo->prepare('UPDATE rate_limits SET hits=hits+1 WHERE bucket=?')->execute([$bucket]);
}
function client_ip(): string {
  $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
  if ($xff) return trim(explode(',', $xff)[0]);
  return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/* Resolve client IP -> Nigerian state (free ip-api.com, cached 30 days). */
function geo_state(): string {
  $ip = client_ip();
  if (!$ip || $ip === '0.0.0.0' || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false)
    return ''; // localhost / LAN — no geo possible
  $key = 'geo:' . $ip;
  $cached = setting($key);
  if ($cached !== null) { $j = json_decode($cached, true); if ($j && time() - ($j['t'] ?? 0) < 86400 * 30) return $j['s']; }
  $state = '';
  if (function_exists('curl_init')) {
    $ch = curl_init('http://ip-api.com/json/' . rawurlencode($ip) . '?fields=status,countryCode,regionName');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 3]);
    $res = curl_exec($ch); curl_close($ch);
    $j = json_decode($res ?: '', true);
    if (($j['status'] ?? '') === 'success' && ($j['countryCode'] ?? '') === 'NG')
      $state = normalize_ng_state($j['regionName'] ?? '');
  }
  try { set_setting($key, json_encode(['s' => $state, 't' => time()])); } catch (Throwable $e) {}
  return $state;
}

/* Map geo provider region names to our geoBoundaries state names. */
function normalize_ng_state(string $r): string {
  $r = trim($r);
  $map = [
    'Federal Capital Territory' => 'FCT Abuja', 'FCT' => 'FCT Abuja', 'Abuja Federal Capital Territory' => 'FCT Abuja',
    'Nassarawa' => 'Nasarawa', 'Cross River State' => 'Cross River',
  ];
  if (isset($map[$r])) return $map[$r];
  $r = preg_replace('/s+State$/i', '', $r);
  $valid = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo',
    'Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
    'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT Abuja'];
  foreach ($valid as $v) if (strcasecmp($v, $r) === 0) return $v;
  return '';
}

/* ---- plan-based daily scan quota ---- */
function check_scan_quota(array $u): void {
  $quotas = ['free' => 25, 'pro' => 1000, 'enterprise' => PHP_INT_MAX];
  $max = $quotas[$u['plan']] ?? 25;
  if ($u['role'] === 'admin' || $max === PHP_INT_MAX) return;
  $st = db()->prepare("SELECT COUNT(*) c FROM scans WHERE user_id=? AND substr(created_at,1,10)=?");
  $st->execute([$u['id'], date('Y-m-d')]);
  if ((int)$st->fetch()['c'] >= $max)
    respond(['error' => "Daily scan limit reached ({$max} on the " . ucfirst($u['plan']) . " plan). Upgrade for more."], 429);
}
function save_scan(int $uid, string $type, string $subject, array $r): int {
  db()->prepare('INSERT INTO scans(user_id,type,subject,verdict,risk,threat_type,explanation,recommendation,meta,state) VALUES(?,?,?,?,?,?,?,?,?,?)')
    ->execute([$uid,$type,mb_substr($subject,0,500),$r['verdict'],$r['risk'],$r['threatType'],$r['explanation'],$r['recommendation'],json_encode($r['meta'] ?? new stdClass()),geo_state()]);
  $id = (int)db()->lastInsertId();
  if ($r['verdict'] === 'danger')
    notify($uid, 'danger', 'High-risk ' . $type . ' detected', mb_substr($subject, 0, 120) . ' — ' . $r['threatType']);
  return $id;
}
