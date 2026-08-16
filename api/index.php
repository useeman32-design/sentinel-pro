<?php
/* ============================================================
   SENTINEL AI — API Router
   All requests: /api/<route>  (front controller)
   Works under: PHP built-in server, Apache (XAMPP .htaccess)
   ============================================================ */
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/engine.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = preg_replace('~^.*?/api/?~', '', $path);
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];
$in = input();

try {
switch (true) {

  /* ================= AUTH ================= */
  case $route === 'health':
    // touching db() here surfaces DB connection/migration problems immediately
    try { db(); $drv = $GLOBALS['DB_DRIVER']; $db_ok = true; }
    catch (Throwable $e) { $drv = 'FAILED: ' . $e->getMessage(); $db_ok = false; }
    respond(['ok' => $db_ok, 'driver' => $drv, 'php' => PHP_VERSION,
             'ext' => ['pdo_mysql' => extension_loaded('pdo_mysql'), 'pdo_sqlite' => extension_loaded('pdo_sqlite'),
                       'curl' => extension_loaded('curl'), 'zip' => class_exists('ZipArchive')],
             'time' => date('c')]);

  case $route === 'debug-auth':
    // Shows exactly which auth headers reach PHP (helps diagnose Apache stripping)
    respond([
      'x_auth_token_received' => isset($_SERVER['HTTP_X_AUTH_TOKEN']) && $_SERVER['HTTP_X_AUTH_TOKEN'] !== '',
      'authorization_received' => ($_SERVER['HTTP_AUTHORIZATION'] ?? '') !== '',
      'redirect_authorization_received' => ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '') !== '',
      'apache_headers_has_auth' => function_exists('apache_request_headers')
        ? array_key_exists('Authorization', array_change_key_case(apache_request_headers(), CASE_LOWER) + ['authorization' => null]) && !empty(array_change_key_case(apache_request_headers(), CASE_LOWER)['authorization'])
        : 'n/a',
      'token_parsed' => bearer() !== null,
      'user_authenticated' => auth_user() !== null,
    ]);

  case $route === 'register' && $method === 'POST': {
    rate_limit('register', client_ip(), 10, 3600);
    $name = trim($in['name'] ?? ''); $email = strtolower(trim($in['email'] ?? '')); $pass = $in['password'] ?? '';
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 8)
      respond(['error' => 'Provide a valid name, email and password (min 8 chars).'], 422);
    $st = db()->prepare('SELECT id FROM users WHERE email=?'); $st->execute([$email]);
    if ($st->fetch()) respond(['error' => 'An account with this email already exists.'], 409);
    $code = strval(random_int(100000, 999999));
    db()->prepare('INSERT INTO users(name,email,password_hash,verify_code) VALUES(?,?,?,?)')
       ->execute([$name, $email, password_hash($pass, PASSWORD_BCRYPT), $code]);
    $uid = (int)db()->lastInsertId();
    notify($uid, 'info', 'Welcome to Sentinel AI', 'Verify your email to unlock all protection modules.');
    // TODO production: send $code via SMTP. Dev mode returns it for demo.
    respond(['token' => issue_token($uid), 'user' => public_user(db()->query("SELECT * FROM users WHERE id=$uid")->fetch()),
             'dev_verify_code' => setting('dev_mode') === '1' ? $code : null]);
  }

  case $route === 'login' && $method === 'POST': {
    rate_limit('login', client_ip() . '|' . strtolower(trim($in['email'] ?? '')), 8, 900);
    $st = db()->prepare('SELECT * FROM users WHERE email=?');
    $st->execute([strtolower(trim($in['email'] ?? ''))]);
    $u = $st->fetch();
    if (!$u || !password_verify($in['password'] ?? '', $u['password_hash'])) respond(['error' => 'Invalid email or password.'], 401);
    if ($u['status'] !== 'active') respond(['error' => 'This account is suspended. Contact support.'], 403);
    respond(['token' => issue_token((int)$u['id']), 'user' => public_user($u)]);
  }

  case $route === 'verify-email' && $method === 'POST': {
    $u = require_auth();
    if (($in['code'] ?? '') !== $u['verify_code'] && setting('dev_mode') !== '1')
      respond(['error' => 'Incorrect verification code.'], 422);
    db()->prepare("UPDATE users SET verified=1, verify_code='' WHERE id=?")->execute([$u['id']]);
    respond(['ok' => true]);
  }

  case $route === 'forgot-password' && $method === 'POST':
    // TODO production: issue reset token + SMTP. Never reveal if email exists.
    respond(['ok' => true]);

  case $route === 'me' && $method === 'GET':
    respond(['user' => public_user(require_auth())]);

  case $route === 'profile' && $method === 'PUT': {
    $u = require_auth();
    db()->prepare('UPDATE users SET name=?, company=? WHERE id=?')
       ->execute([trim($in['name'] ?? $u['name']), trim($in['company'] ?? $u['company']), $u['id']]);
    respond(['ok' => true]);
  }

  case $route === 'change-password' && $method === 'POST': {
    $u = require_auth();
    rate_limit('chpass', (string)$u['id'], 5, 900);
    if (!password_verify($in['current'] ?? '', $u['password_hash']))
      respond(['error' => 'Current password is incorrect.'], 422);
    if (strlen($in['new'] ?? '') < 8) respond(['error' => 'New password must be at least 8 characters.'], 422);
    db()->prepare('UPDATE users SET password_hash=? WHERE id=?')
       ->execute([password_hash($in['new'], PASSWORD_BCRYPT), $u['id']]);
    // revoke all other sessions for safety
    db()->prepare("DELETE FROM tokens WHERE user_id=? AND type='session' AND token_hash!=?")
       ->execute([$u['id'], hash('sha256', bearer())]);
    notify((int)$u['id'], 'ok', 'Password changed', 'Your password was updated and other sessions were signed out.');
    respond(['ok' => true]);
  }

  /* ================= SCANNERS (REAL) ================= */
  case $route === 'link-scan' && $method === 'POST': {
    $u = require_auth();
    check_scan_quota($u);
    $url = trim($in['url'] ?? ''); if (!$url) respond(['error' => 'URL required'], 422);
    $r = Engine::scanUrl($url);
    save_scan((int)$u['id'], 'link', $url, $r);
    respond($r);
  }

  case $route === 'email-scan' && $method === 'POST': {
    $u = require_auth();
    check_scan_quota($u);
    $c = $in['content'] ?? ''; if (mb_strlen($c) < 20) respond(['error' => 'Provide more email content'], 422);
    $r = Engine::scanText('email', $c);
    save_scan((int)$u['id'], 'email', $r['subject'], $r);
    respond($r);
  }

  case $route === 'sms-scan' && $method === 'POST': {
    $u = require_auth();
    check_scan_quota($u);
    $c = $in['content'] ?? ''; if (mb_strlen($c) < 10) respond(['error' => 'Provide the SMS text'], 422);
    $r = Engine::scanText('sms', $c);
    save_scan((int)$u['id'], 'sms', $r['subject'], $r);
    respond($r);
  }

  case $route === 'qr-scan' && $method === 'POST': {
    // client decodes QR image locally (jsQR) and sends decoded text — we analyze the destination
    $u = require_auth();
    check_scan_quota($u);
    $decoded = trim($in['decoded'] ?? '');
    if (!$decoded) respond(['error' => 'No QR content decoded'], 422);
    $r = preg_match('~^https?://|^www\.~i', $decoded) ? Engine::scanUrl($decoded) : Engine::scanText('sms', $decoded);
    $r['meta']['decoded'] = $decoded;
    save_scan((int)$u['id'], 'qr', $decoded, $r);
    respond($r);
  }

  case $route === 'file-scan' && $method === 'POST': {
    $u = require_auth();
    check_scan_quota($u);
    if (empty($_FILES['file'])) respond(['error' => 'No file uploaded'], 422);
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) respond(['error' => 'Upload failed (code ' . $f['error'] . ')'], 422);
    if ($f['size'] > 50 * 1024 * 1024) respond(['error' => 'Max file size is 50 MB'], 422);
    $r = Engine::scanFile($f['name'], $f['tmp_name']);
    save_scan((int)$u['id'], 'file', $f['name'], $r);
    respond($r);
  }

  case $route === 'breach-check' && $method === 'POST': {
    $u = require_auth();
    check_scan_quota($u);
    $email = trim($in['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Valid email required'], 422);
    $r = Engine::breachCheck($email);
    save_scan((int)$u['id'], 'breach', $email, [
      'verdict' => $r['breached'] ? 'danger' : 'safe', 'risk' => $r['breached'] ? 70 : 5,
      'threatType' => $r['breached'] ? count($r['breaches']) . ' breach exposure(s)' : 'No exposure',
      'explanation' => '', 'recommendation' => $r['recommendation']]);
    respond($r);
  }

  /* ================= CHAT (Gemini proxy) ================= */
  case $route === 'chat' && $method === 'POST': {
    $u = require_auth();
    $msg = trim($in['message'] ?? ''); if (!$msg) respond(['error' => 'Message required'], 422);
    $sid = preg_replace('/[^a-zA-Z0-9_-]/', '', $in['session_id'] ?? '');
    db()->prepare("INSERT INTO chat_messages(user_id,session_id,role,content) VALUES(?,?,'user',?)")->execute([$u['id'], $sid, $msg]);
    $key = setting('gemini_api_key', '');
    $reply = null;
    if ($key) {
      $hist = array_map(fn($h) => ['role' => ($h['role'] ?? '') === 'ai' ? 'model' : 'user', 'parts' => [['text' => $h['text'] ?? '']]],
                        array_slice($in['history'] ?? [], -10));
      $hist[] = ['role' => 'user', 'parts' => [['text' => $msg]]];
      $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . urlencode($key));
      curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>30,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json'],
        CURLOPT_POSTFIELDS=>json_encode([
          'system_instruction'=>['parts'=>[['text'=>"You are Sentinel AI, an expert cybersecurity assistant protecting Nigeria's digital economy. Be concise and practical. Mention reporting channels (bank fraud line, ngCERT cert.gov.ng, EFCC) when users may be fraud victims. Never help with cybercrime."]]],
          'contents'=>$hist, 'generationConfig'=>['temperature'=>0.4,'maxOutputTokens'=>800]])]);
      $res = curl_exec($ch); curl_close($ch);
      $j = json_decode($res ?: '', true);
      $reply = $j['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }
    $reply = $reply ?? "I couldn't reach the AI service. The admin can configure a Gemini API key in the Admin Panel → Settings to enable live answers. Meanwhile, try the scanners in the menu for link/email/SMS analysis.";
    db()->prepare("INSERT INTO chat_messages(user_id,session_id,role,content) VALUES(?,?,'ai',?)")->execute([$u['id'], $sid, $reply]);
    respond(['reply' => $reply, 'source' => $key ? 'gemini' : 'fallback']);
  }

  /* ================= DATA ================= */
  case $route === 'dashboard' && $method === 'GET': {
    $u = require_auth(); $uid = (int)$u['id'];
    $days = []; // last 7 days scan counts
    for ($i = 6; $i >= 0; $i--) $days[date('M j', strtotime("-$i days"))] = 0;
    $rows = db()->query("SELECT substr(created_at,1,10) d, COUNT(*) c, SUM(CASE WHEN verdict='danger' THEN 1 ELSE 0 END) t
      FROM scans WHERE user_id=$uid GROUP BY substr(created_at,1,10) ORDER BY d DESC LIMIT 7")->fetchAll();
    $threatsPerDay = [];
    foreach (array_keys($days) as $lbl) $threatsPerDay[] = ['l' => $lbl, 'v' => 0];
    foreach ($rows as $r) { $lbl = date('M j', strtotime($r['d'])); foreach ($threatsPerDay as &$tp) if ($tp['l'] === $lbl) $tp['v'] = (int)$r['t']; }
    $tot = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid")->fetch()['c'];
    $danger = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='danger'")->fetch()['c'];
    $warn = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='warn'")->fetch()['c'];
    $score = max(20, min(98, 90 - $danger * 4 - $warn + (int)($tot * 0.5)));
    $recent = db()->query("SELECT type,subject,verdict,risk,threat_type,created_at FROM scans WHERE user_id=$uid ORDER BY id DESC LIMIT 6")->fetchAll();
    $cats = db()->query("SELECT threat_type l, COUNT(*) v FROM scans WHERE user_id=$uid AND verdict!='safe' AND threat_type!='None Detected' GROUP BY threat_type ORDER BY v DESC LIMIT 5")->fetchAll();
    respond(['score'=>$score,'threats'=>(int)$danger,'blocked'=>(int)$danger,'warnings'=>(int)$warn,'total_scans'=>(int)$tot,
      'threatsPerDay'=>$threatsPerDay,'categories'=>$cats,'recent'=>$recent]);
  }

  case $route === 'threat-intel' && $method === 'GET': {
    require_auth();
    $alerts = db()->query("SELECT id,level,title,descr,category tag,detail_json,created_at FROM threat_intel WHERE active=1 ORDER BY id DESC LIMIT 30")->fetchAll();
    respond(['alerts' => $alerts]);
  }

  case $route === 'notifications' && $method === 'GET': {
    $u = require_auth();
    $rows = db()->prepare('SELECT id,type,title,body,read_at,created_at FROM notifications WHERE user_id=? OR user_id IS NULL ORDER BY id DESC LIMIT 30');
    $rows->execute([$u['id']]);
    respond(['items' => $rows->fetchAll()]);
  }

  case $route === 'notifications/read' && $method === 'POST': {
    $u = require_auth();
    db()->prepare("UPDATE notifications SET read_at=? WHERE user_id=?")->execute([date('Y-m-d H:i:s'), $u['id']]);
    respond(['ok' => true]);
  }

  case $route === 'reports' && $method === 'GET': {
    $u = require_auth();
    $st = db()->prepare('SELECT ref id, title, risk_level risk, threat_count threats, created_at date FROM reports WHERE user_id=? ORDER BY id DESC');
    $st->execute([$u['id']]);
    respond(['items' => $st->fetchAll()]);
  }

  case $route === 'reports' && $method === 'POST': {
    $u = require_auth(); $uid = (int)$u['id'];
    $danger = (int)db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='danger'")->fetch()['c'];
    $warn = (int)db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='warn'")->fetch()['c'];
    $ref = 'RPT-' . random_int(1000, 9999);
    $risk = $danger >= 5 ? 'High' : ($danger >= 1 || $warn >= 3 ? 'Medium' : 'Low');
    db()->prepare('INSERT INTO reports(user_id,ref,title,risk_level,threat_count,body_json) VALUES(?,?,?,?,?,?)')
       ->execute([$uid, $ref, 'Security Summary — ' . date('M j, Y'), $risk, $danger + $warn,
                  json_encode(['danger' => $danger, 'warn' => $warn])]);
    respond(['ok' => true, 'ref' => $ref]);
  }

  /* ================= ADMIN PANEL API ================= */
  case $route === 'admin/stats' && $method === 'GET': {
    require_admin();
    $q = fn($sql) => db()->query($sql)->fetch();
    respond([
      'users' => (int)$q('SELECT COUNT(*) c FROM users')['c'],
      'scans' => (int)$q('SELECT COUNT(*) c FROM scans')['c'],
      'threats' => (int)$q("SELECT COUNT(*) c FROM scans WHERE verdict='danger'")['c'],
      'signatures' => (int)$q('SELECT COUNT(*) c FROM signatures WHERE enabled=1')['c'],
      'blocklist' => (int)$q('SELECT COUNT(*) c FROM blocklist WHERE enabled=1')['c'],
      'intel' => (int)$q('SELECT COUNT(*) c FROM threat_intel WHERE active=1')['c'],
      'recent_scans' => db()->query('SELECT s.*, u.email FROM scans s JOIN users u ON u.id=s.user_id ORDER BY s.id DESC LIMIT 12')->fetchAll(),
      'db_driver' => $GLOBALS['DB_DRIVER'],
    ]);
  }

  case $route === 'admin/users' && $method === 'GET': {
    require_admin();
    respond(['items' => db()->query('SELECT id,name,email,role,plan,status,verified,created_at FROM users ORDER BY id DESC')->fetchAll()]);
  }
  case preg_match('~^admin/users/(\d+)$~', $route, $m) && $method === 'PUT': {
    $admin = require_admin();
    $uid = (int)$m[1];
    if ($uid === (int)$admin['id'] && ($in['role'] ?? 'admin') !== 'admin') respond(['error' => 'Cannot demote yourself'], 422);
    foreach (['role' => ['member','analyst','admin'], 'plan' => ['free','pro','enterprise'], 'status' => ['active','suspended']] as $f => $allowed)
      if (isset($in[$f]) && in_array($in[$f], $allowed))
        db()->prepare("UPDATE users SET $f=? WHERE id=?")->execute([$in[$f], $uid]);
    respond(['ok' => true]);
  }

  case $route === 'admin/signatures' && $method === 'GET':
    require_admin();
    respond(['items' => db()->query('SELECT * FROM signatures ORDER BY channel, id')->fetchAll()]);
  case $route === 'admin/signatures' && $method === 'POST': {
    require_admin();
    if (@preg_match($in['pattern'] ?? '', '') === false) respond(['error' => 'Invalid regex pattern'], 422);
    db()->prepare('INSERT INTO signatures(channel,category,pattern,weight) VALUES(?,?,?,?)')
       ->execute([$in['channel'], $in['category'], $in['pattern'], (int)$in['weight']]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/signatures/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    db()->prepare('UPDATE signatures SET enabled=? WHERE id=?')->execute([(int)$in['enabled'], (int)$m[1]]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/signatures/(\d+)$~', $route, $m) && $method === 'DELETE': {
    require_admin();
    db()->prepare('DELETE FROM signatures WHERE id=?')->execute([(int)$m[1]]);
    respond(['ok' => true]);
  }

  case $route === 'admin/blocklist' && $method === 'GET':
    require_admin();
    respond(['items' => db()->query('SELECT * FROM blocklist ORDER BY id DESC')->fetchAll()]);
  case $route === 'admin/blocklist' && $method === 'POST': {
    require_admin();
    $p = strtolower(trim($in['pattern'] ?? '')); if (!$p) respond(['error' => 'Pattern required'], 422);
    db()->prepare('INSERT INTO blocklist(pattern,type,note) VALUES(?,?,?)')
       ->execute([$p, $in['type'] ?? 'domain', $in['note'] ?? '']);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/blocklist/(\d+)$~', $route, $m) && $method === 'DELETE': {
    require_admin();
    db()->prepare('DELETE FROM blocklist WHERE id=?')->execute([(int)$m[1]]);
    respond(['ok' => true]);
  }

  case $route === 'admin/intel' && $method === 'POST': {
    require_admin();
    db()->prepare('INSERT INTO threat_intel(level,title,descr,category) VALUES(?,?,?,?)')
       ->execute([$in['level'] ?? 'info', trim($in['title'] ?? ''), trim($in['descr'] ?? ''), trim($in['category'] ?? 'General')]);
    notify(null, $in['level'] === 'danger' ? 'danger' : 'info', 'New threat alert', $in['title'] ?? '');
    respond(['ok' => true]);
  }
  case preg_match('~^admin/intel/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    db()->prepare('UPDATE threat_intel SET active=? WHERE id=?')->execute([(int)$in['active'], (int)$m[1]]);
    respond(['ok' => true]);
  }

  case $route === 'admin/settings' && $method === 'GET': {
    require_admin();
    $key = setting('gemini_api_key', '');
    respond(['dev_mode' => setting('dev_mode', '0'), 'gemini_key_set' => $key !== '',
             'gemini_key_masked' => $key ? substr($key, 0, 6) . '••••••••' : '']);
  }
  case $route === 'admin/settings' && $method === 'POST': {
    require_admin();
    if (isset($in['gemini_api_key'])) set_setting('gemini_api_key', trim($in['gemini_api_key']));
    if (isset($in['dev_mode'])) set_setting('dev_mode', $in['dev_mode'] ? '1' : '0');
    respond(['ok' => true]);
  }

  case $route === 'admin/broadcast' && $method === 'POST': {
    require_admin();
    $users = db()->query('SELECT id FROM users')->fetchAll(PDO::FETCH_COLUMN);
    $st = db()->prepare('INSERT INTO notifications(user_id,type,title,body) VALUES(?,?,?,?)');
    foreach ($users as $uid) $st->execute([$uid, $in['type'] ?? 'info', trim($in['title'] ?? ''), trim($in['body'] ?? '')]);
    respond(['ok' => true, 'sent' => count($users)]);
  }

  default:
    respond(['error' => 'Not found: ' . $route], 404);
}
} catch (Throwable $e) {
  // always log full details server-side
  $msg = $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine();
  @error_log('[' . date('c') . "] {$route} — {$msg}\n" . $e->getTraceAsString() . "\n", 3, __DIR__ . '/data/error.log');
  // show detail unless dev_mode is explicitly OFF
  $detail = $msg;
  try { if (setting('dev_mode') === '0') $detail = null; } catch (Throwable $e2) { /* keep detail */ }
  respond(['error' => 'Server error', 'detail' => $detail], 500);
}
