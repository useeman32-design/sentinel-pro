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
    $langNames = ['ha' => 'Hausa', 'ig' => 'Igbo', 'yo' => 'Yoruba', 'pcm' => 'Nigerian Pidgin'];
    $langInstr = isset($langNames[$in['lang'] ?? '']) ? ' Reply in ' . $langNames[$in['lang']] . ' language.' : '';
    $system = "You are Sentinel AI, an expert cybersecurity assistant protecting Nigeria's digital economy. Be concise and practical. Mention reporting channels (bank fraud line, ngCERT cert.gov.ng, EFCC) when users may be fraud victims. Never help with cybercrime." . $langInstr;
    $reply = null; $used = null;
    $prov = setting('llm_provider', 'gemini'); if ($prov === 'grok') $prov = 'groq';
    $order = $prov === 'groq' ? ['groq', 'gemini'] : ['gemini', 'groq'];
    foreach ($order as $p) {
      if ($p === 'gemini' && setting('gemini_api_key', '')) {
        $key = setting('gemini_api_key');
        $hist = array_map(fn($h) => ['role' => ($h['role'] ?? '') === 'ai' ? 'model' : 'user', 'parts' => [['text' => $h['text'] ?? '']]],
                          array_slice($in['history'] ?? [], -10));
        $hist[] = ['role' => 'user', 'parts' => [['text' => $msg]]];
        $gm = setting('gemini_model', 'gemini-flash-latest');
        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($gm) . ':generateContent?key=' . urlencode($key));
        curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>30,
          CURLOPT_HTTPHEADER=>['Content-Type: application/json'],
          CURLOPT_POSTFIELDS=>json_encode([
            'system_instruction'=>['parts'=>[['text'=>$system]]],
            'contents'=>$hist, 'generationConfig'=>['temperature'=>0.4,'maxOutputTokens'=>1600,'thinkingConfig'=>['thinkingBudget'=>0]]])]);
        $res = curl_exec($ch); curl_close($ch);
        $j = json_decode($res ?: '', true);
        $reply = null;
        foreach (($j['candidates'][0]['content']['parts'] ?? []) as $part)
          if (isset($part['text']) && trim($part['text']) !== '') { $reply = $part['text']; break; }
        if ($reply) { $used = 'gemini'; break; }
      }
      if ($p === 'groq' && (setting('groq_api_key', '') ?: setting('grok_api_key', ''))) {
        $gkey = setting('groq_api_key', '') ?: setting('grok_api_key', '');
        $msgs = [['role' => 'system', 'content' => $system]];
        foreach (array_slice($in['history'] ?? [], -10) as $h)
          $msgs[] = ['role' => ($h['role'] ?? '') === 'ai' ? 'assistant' : 'user', 'content' => $h['text'] ?? ''];
        $msgs[] = ['role' => 'user', 'content' => $msg];
        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>30,
          CURLOPT_HTTPHEADER=>['Content-Type: application/json', 'Authorization: Bearer ' . $gkey],
          CURLOPT_POSTFIELDS=>json_encode(['model'=>setting('groq_model','llama-3.3-70b-versatile'),
            'messages'=>$msgs, 'temperature'=>0.4, 'max_tokens'=>800])]);
        $res = curl_exec($ch); curl_close($ch);
        $j = json_decode($res ?: '', true);
        $reply = $j['choices'][0]['message']['content'] ?? null;
        if ($reply) { $used = 'groq'; break; }
      }
    }
    $reply = $reply ?? "I couldn't reach the AI service. The admin can configure a Gemini API key in the Admin Panel → Settings to enable live answers. Meanwhile, try the scanners in the menu for link/email/SMS analysis.";
    db()->prepare("INSERT INTO chat_messages(user_id,session_id,role,content) VALUES(?,?,'ai',?)")->execute([$u['id'], $sid, $reply]);
    respond(['reply' => $reply, 'source' => $used ?: 'fallback']);
  }

  /* ================= DATA ================= */
  case $route === 'dashboard' && $method === 'GET': {
    $u = require_auth(); $uid = (int)$u['id'];
    $days = []; // last 7 days scan counts
    for ($i = 6; $i >= 0; $i--) $days[date('M j', strtotime("-$i days"))] = 0;
    $rows = db()->query("SELECT substr(created_at,1,10) d, COUNT(*) c, SUM(CASE WHEN verdict='danger' THEN 1 ELSE 0 END) t
      FROM scans WHERE user_id=$uid GROUP BY substr(created_at,1,10) ORDER BY d DESC LIMIT 7")->fetchAll();
    $threatsPerDay = []; $scansPerDay = [];
    foreach (array_keys($days) as $lbl) { $threatsPerDay[] = ['l' => $lbl, 'v' => 0]; $scansPerDay[] = ['l' => $lbl, 'v' => 0]; }
    foreach ($rows as $r) {
      $lbl = date('M j', strtotime($r['d']));
      foreach ($threatsPerDay as &$tp) if ($tp['l'] === $lbl) $tp['v'] = (int)$r['t'];
      unset($tp);
      foreach ($scansPerDay as &$sp) if ($sp['l'] === $lbl) $sp['v'] = (int)$r['c'];
      unset($sp);
    }
    $tot = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid")->fetch()['c'];
    $danger = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='danger'")->fetch()['c'];
    $warn = db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND verdict='warn'")->fetch()['c'];
    $score = max(20, min(98, 90 - $danger * 4 - $warn + (int)($tot * 0.5)));
    $recent = db()->query("SELECT type,subject,verdict,risk,threat_type,created_at FROM scans WHERE user_id=$uid ORDER BY id DESC LIMIT 6")->fetchAll();
    $cats = db()->query("SELECT threat_type l, COUNT(*) v FROM scans WHERE user_id=$uid AND verdict!='safe' AND threat_type!='None Detected' GROUP BY threat_type ORDER BY v DESC LIMIT 5")->fetchAll();
    respond(['score'=>$score,'threats'=>(int)$danger,'blocked'=>(int)$danger,'warnings'=>(int)$warn,'total_scans'=>(int)$tot,
      'threatsPerDay'=>$threatsPerDay,'scansPerDay'=>$scansPerDay,'categories'=>$cats,'recent'=>$recent]);
  }

  case $route === 'threat-map' && $method === 'GET': {
    require_auth();
    // real platform-wide aggregation by state (all users, anonymized counts)
    $rows = db()->query("SELECT state,
        COUNT(*) scans,
        SUM(CASE WHEN verdict='danger' THEN 1 ELSE 0 END) blocked,
        SUM(CASE WHEN verdict='warn' THEN 1 ELSE 0 END) warns
      FROM scans WHERE state != '' GROUP BY state")->fetchAll();
    $top = db()->query("SELECT state, threat_type FROM scans
      WHERE state != '' AND verdict != 'safe' AND threat_type NOT IN ('', 'None Detected')")->fetchAll();
    $topByState = [];
    foreach ($top as $t) {
      $first = trim(explode('+', $t['threat_type'])[0]);
      $topByState[$t['state']][$first] = ($topByState[$t['state']][$first] ?? 0) + 1;
    }
    $out = [];
    $maxActivity = 1;
    foreach ($rows as $r) {
      $activity = (int)$r['blocked'] * 3 + (int)$r['warns'] * 2 + (int)$r['scans'];
      $maxActivity = max($maxActivity, $activity);
      $tt = $topByState[$r['state']] ?? [];
      arsort($tt);
      $out[$r['state']] = ['scans' => (int)$r['scans'], 'blocked' => (int)$r['blocked'],
        'warns' => (int)$r['warns'], 'activity' => $activity, 'top' => $tt ? array_key_first($tt) : '—'];
    }
    foreach ($out as &$o) $o['idx'] = (int)round($o['activity'] / $maxActivity * 100);
    $tot = db()->query("SELECT COUNT(*) c, SUM(CASE WHEN verdict='danger' THEN 1 ELSE 0 END) d FROM scans WHERE substr(created_at,1,10)=" . db()->quote(date('Y-m-d')))->fetch();
    respond(['states' => $out, 'total_today' => (int)($tot['c'] ?? 0), 'blocked_today' => (int)($tot['d'] ?? 0),
             'covered' => count($out), 'geo_note' => count($out) ? null : 'No geo-locatable scans yet — scans from localhost/LAN cannot be located. Data appears once real users scan from Nigerian networks.']);
  }

  case $route === 'threat-intel' && $method === 'GET': {
    require_auth();
    $alerts = db()->query("SELECT id,level,title,descr,category tag,detail_json,created_at FROM threat_intel WHERE active=1 ORDER BY id DESC LIMIT 30")->fetchAll();
    respond(['alerts' => $alerts]);
  }

  case $route === 'notifications' && $method === 'GET': {
    $u = require_auth();
    $rows = db()->prepare('SELECT id,type,title,body,read_at,created_at,from_admin FROM notifications WHERE user_id=? OR user_id IS NULL ORDER BY id DESC LIMIT 30');
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

  case $route === 'scans' && $method === 'GET': {
    $u = require_auth();
    $type = $_GET['type'] ?? ''; $verdict = $_GET['verdict'] ?? '';
    $from = $_GET['from'] ?? ''; $to = $_GET['to'] ?? '';
    $sql = 'SELECT id,type,subject,verdict,risk,threat_type,created_at FROM scans WHERE user_id=?';
    $args = [$u['id']];
    if ($type && in_array($type, ['link','email','sms','qr','file','breach'])) { $sql .= ' AND type=?'; $args[] = $type; }
    if ($verdict && in_array($verdict, ['safe','warn','danger'])) { $sql .= ' AND verdict=?'; $args[] = $verdict; }
    if ($from) { $sql .= ' AND substr(created_at,1,10)>=?'; $args[] = $from; }
    if ($to) { $sql .= ' AND substr(created_at,1,10)<=?'; $args[] = $to; }
    $sql .= ' ORDER BY id DESC LIMIT 200';
    $st = db()->prepare($sql); $st->execute($args);
    respond(['items' => $st->fetchAll()]);
  }

  case $route === 'reports' && $method === 'POST': {
    $u = require_auth(); $uid = (int)$u['id'];
    $from = $in['from'] ?? date('Y-m-d', strtotime('-30 days'));
    $to = $in['to'] ?? date('Y-m-d');
    $types = array_values(array_intersect((array)($in['types'] ?? []), ['link','email','sms','qr','file','breach']));
    $sqlT = $types ? " AND type IN ('" . implode("','", $types) . "')" : '';
    $q = fn($extra) => (int)db()->query("SELECT COUNT(*) c FROM scans WHERE user_id=$uid AND substr(created_at,1,10)>='$from' AND substr(created_at,1,10)<='$to' $sqlT $extra")->fetch()['c'];
    $total = $q(''); $danger = $q("AND verdict='danger'"); $warn = $q("AND verdict='warn'");
    $byType = db()->query("SELECT type, COUNT(*) c FROM scans WHERE user_id=$uid AND substr(created_at,1,10)>='$from' AND substr(created_at,1,10)<='$to' $sqlT GROUP BY type")->fetchAll();
    $ref = 'RPT-' . random_int(1000, 9999);
    $risk = $danger >= 5 ? 'High' : ($danger >= 1 || $warn >= 3 ? 'Medium' : 'Low');
    db()->prepare('INSERT INTO reports(user_id,ref,title,risk_level,threat_count,body_json) VALUES(?,?,?,?,?,?)')
       ->execute([$uid, $ref, 'Security Report ' . $from . ' → ' . $to, $risk, $danger + $warn,
                  json_encode(['from'=>$from,'to'=>$to,'types'=>$types,'total'=>$total,'danger'=>$danger,'warn'=>$warn,'byType'=>$byType])]);
    respond(['ok' => true, 'ref' => $ref, 'summary' => ['total'=>$total,'danger'=>$danger,'warn'=>$warn,'byType'=>$byType,'from'=>$from,'to'=>$to,'risk'=>$risk]]);
  }

  /* ================= CYBER ACADEMY ================= */
  case $route === 'courses' && $method === 'GET': {
    $u = require_auth();
    require_once __DIR__ . '/engine.php';
    $lang = in_array($_GET['lang'] ?? '', ['ha','ig','yo','pcm']) ? $_GET['lang'] : '';
    $courses = db()->query('SELECT * FROM courses WHERE active=1 ORDER BY id')->fetchAll();
    if ($lang) foreach ($courses as &$cc) {
      $cc['title'] = Engine::translate('course', (int)$cc['id'], $lang, 'title', $cc['title']);
      $cc['description'] = Engine::translate('course', (int)$cc['id'], $lang, 'description', $cc['description'] ?? '');
    }
    unset($cc);
    $prog = db()->prepare('SELECT * FROM course_progress WHERE user_id=?');
    $prog->execute([$u['id']]);
    $pmap = [];
    foreach ($prog->fetchAll() as $p) $pmap[$p['course_id']] = $p;
    foreach ($courses as &$c) {
      $c['lesson_count'] = (int)db()->query('SELECT COUNT(*) c FROM lessons WHERE course_id=' . (int)$c['id'])->fetch()['c'];
      $p = $pmap[$c['id']] ?? null;
      $done = $p ? count(json_decode($p['lessons_done'] ?: '[]', true)) : 0;
      $c['progress'] = $c['lesson_count'] ? (int)round($done / $c['lesson_count'] * 100 * 0.8) : 0; // quiz = last 20%
      if ($p && $p['completed_at']) $c['progress'] = 100;
      $c['certificate_ref'] = $p['certificate_ref'] ?? null;
    }
    respond(['items' => $courses]);
  }

  case preg_match('~^courses/(\d+)$~', $route, $m) && $method === 'GET': {
    $u = require_auth();
    $cid = (int)$m[1];
    $c = db()->query('SELECT * FROM courses WHERE id=' . $cid . ' AND active=1')->fetch();
    if (!$c) respond(['error' => 'Course not found'], 404);
    require_once __DIR__ . '/engine.php';
    $lang = in_array($_GET['lang'] ?? '', ['ha','ig','yo','pcm']) ? $_GET['lang'] : '';
    if ($lang) {
      $c['title'] = Engine::translate('course', $cid, $lang, 'title', $c['title']);
      $c['description'] = Engine::translate('course', $cid, $lang, 'description', $c['description'] ?? '');
    }
    $c['lessons'] = db()->query('SELECT id,position,title,body_html,video_url FROM lessons WHERE course_id=' . $cid . ' ORDER BY position')->fetchAll();
    if ($lang) foreach ($c['lessons'] as &$l) {
      $l['title'] = Engine::translate('lesson', (int)$l['id'], $lang, 'title', $l['title']);
      $l['body_html'] = Engine::translate('lesson', (int)$l['id'], $lang, 'body', $l['body_html'] ?? '');
    }
    unset($l);
    $qz = db()->query('SELECT id,question,options_json FROM quiz_questions WHERE course_id=' . $cid)->fetchAll();
    foreach ($qz as &$q) {
      $q['options'] = json_decode($q['options_json'], true);
      unset($q['options_json']);
      if ($lang) {
        $q['question'] = Engine::translate('quiz', (int)$q['id'], $lang, 'question', $q['question']);
        $tOpts = Engine::translate('quiz', (int)$q['id'], $lang, 'options', json_encode($q['options'], JSON_UNESCAPED_UNICODE));
        $dec = json_decode($tOpts, true);
        if (is_array($dec) && count($dec) === count($q['options'])) $q['options'] = $dec;
      }
    }
    $c['quiz'] = $qz;
    $st = db()->prepare('SELECT * FROM course_progress WHERE user_id=? AND course_id=?');
    $st->execute([$u['id'], $cid]);
    $p = $st->fetch();
    $c['my'] = ['lessons_done' => $p ? json_decode($p['lessons_done'] ?: '[]', true) : [],
                'quiz_score' => $p['quiz_score'] ?? null, 'completed_at' => $p['completed_at'] ?? null,
                'certificate_ref' => $p['certificate_ref'] ?? null];
    respond($c);
  }

  case preg_match('~^courses/(\d+)/lesson-done$~', $route, $m) && $method === 'POST': {
    $u = require_auth(); $cid = (int)$m[1]; $lid = (int)($in['lesson_id'] ?? 0);
    $st = db()->prepare('SELECT * FROM course_progress WHERE user_id=? AND course_id=?');
    $st->execute([$u['id'], $cid]); $p = $st->fetch();
    $done = $p ? json_decode($p['lessons_done'] ?: '[]', true) : [];
    if (!in_array($lid, $done)) $done[] = $lid;
    if ($p) db()->prepare('UPDATE course_progress SET lessons_done=? WHERE id=?')->execute([json_encode($done), $p['id']]);
    else db()->prepare('INSERT INTO course_progress(user_id,course_id,lessons_done) VALUES(?,?,?)')->execute([$u['id'], $cid, json_encode($done)]);
    respond(['ok' => true, 'done' => $done]);
  }

  case preg_match('~^courses/(\d+)/quiz$~', $route, $m) && $method === 'POST': {
    $u = require_auth(); $cid = (int)$m[1];
    $answers = (array)($in['answers'] ?? []);
    $qz = db()->query('SELECT id,correct_index FROM quiz_questions WHERE course_id=' . $cid)->fetchAll();
    if (!$qz) respond(['error' => 'No quiz for this course'], 404);
    $correct = 0;
    foreach ($qz as $i => $q) if ((int)($answers[$i] ?? -1) === (int)$q['correct_index']) $correct++;
    $scorePct = (int)round($correct / count($qz) * 100);
    $passed = $scorePct >= 70;
    $st = db()->prepare('SELECT * FROM course_progress WHERE user_id=? AND course_id=?');
    $st->execute([$u['id'], $cid]); $p = $st->fetch();
    $cert = null;
    if ($passed) {
      $cert = 'CERT-' . strtoupper(substr(md5($u['id'] . '-' . $cid . '-' . time()), 0, 8));
      if ($p) db()->prepare('UPDATE course_progress SET quiz_score=?, completed_at=?, certificate_ref=? WHERE id=?')
                  ->execute([$scorePct, date('Y-m-d H:i:s'), $cert, $p['id']]);
      else db()->prepare('INSERT INTO course_progress(user_id,course_id,lessons_done,quiz_score,completed_at,certificate_ref) VALUES(?,?,?,?,?,?)')
               ->execute([$u['id'], $cid, '[]', $scorePct, date('Y-m-d H:i:s'), $cert]);
      notify((int)$u['id'], 'ok', 'Certificate earned! 🏆', 'You passed with ' . $scorePct . '% — certificate ' . $cert);
    } else {
      if ($p) db()->prepare('UPDATE course_progress SET quiz_score=? WHERE id=?')->execute([$scorePct, $p['id']]);
      else db()->prepare('INSERT INTO course_progress(user_id,course_id,lessons_done,quiz_score) VALUES(?,?,?,?)')->execute([$u['id'], $cid, '[]', $scorePct]);
    }
    respond(['score' => $scorePct, 'passed' => $passed, 'correct' => $correct, 'total' => count($qz), 'certificate_ref' => $cert]);
  }

  /* ================= COMMUNITY ================= */
  case $route === 'posts' && $method === 'GET': {
    $u = require_auth();
    $cat = $_GET['category'] ?? ''; $qq = $_GET['q'] ?? '';
    $sql = "SELECT p.*, u.name author FROM posts p JOIN users u ON u.id=p.user_id WHERE p.status='active'";
    $args = [];
    if ($cat) { $sql .= ' AND p.category=?'; $args[] = $cat; }
    if ($qq) { $sql .= ' AND (p.title LIKE ? OR p.body LIKE ?)'; $args[] = "%$qq%"; $args[] = "%$qq%"; }
    $sql .= ' ORDER BY p.id DESC LIMIT 50';
    $st = db()->prepare($sql); $st->execute($args);
    $items = $st->fetchAll();
    $likes = db()->prepare('SELECT post_id FROM post_likes WHERE user_id=?');
    $likes->execute([$u['id']]);
    $mine = array_column($likes->fetchAll(), 'post_id');
    foreach ($items as &$p) {
      $p['comment_count'] = (int)db()->query("SELECT COUNT(*) c FROM comments WHERE post_id={$p['id']} AND status='active'")->fetch()['c'];
      $p['liked'] = in_array($p['id'], $mine);
      $p['mine'] = (int)$p['user_id'] === (int)$u['id'];
    }
    respond(['items' => $items]);
  }

  case $route === 'posts' && $method === 'POST': {
    $u = require_auth();
    rate_limit('post', (string)$u['id'], 10, 3600);
    $title = trim($in['title'] ?? ''); $body = trim($in['body'] ?? '');
    if (mb_strlen($title) < 5) respond(['error' => 'Title too short (min 5 chars)'], 422);
    db()->prepare('INSERT INTO posts(user_id,title,body,category) VALUES(?,?,?,?)')
       ->execute([$u['id'], mb_substr($title, 0, 200), mb_substr($body, 0, 5000), mb_substr(trim($in['category'] ?? 'General'), 0, 40)]);
    respond(['ok' => true, 'id' => (int)db()->lastInsertId()]);
  }

  case preg_match('~^posts/(\d+)$~', $route, $m) && $method === 'GET': {
    $u = require_auth(); $pid = (int)$m[1];
    db()->prepare('UPDATE posts SET views=views+1 WHERE id=?')->execute([$pid]);
    $st = db()->prepare("SELECT p.*, u.name author FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.status='active'");
    $st->execute([$pid]); $p = $st->fetch();
    if (!$p) respond(['error' => 'Post not found'], 404);
    $cs = db()->prepare("SELECT c.*, u.name author, u.role FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? AND c.status='active' ORDER BY c.id");
    $cs->execute([$pid]);
    $p['comments'] = $cs->fetchAll();
    $lk = db()->prepare('SELECT 1 FROM post_likes WHERE post_id=? AND user_id=?');
    $lk->execute([$pid, $u['id']]);
    $p['liked'] = (bool)$lk->fetch();
    $p['mine'] = (int)$p['user_id'] === (int)$u['id'];
    respond($p);
  }

  case preg_match('~^posts/(\d+)/like$~', $route, $m) && $method === 'POST': {
    $u = require_auth(); $pid = (int)$m[1];
    $st = db()->prepare('SELECT id FROM post_likes WHERE post_id=? AND user_id=?');
    $st->execute([$pid, $u['id']]);
    if ($row = $st->fetch()) {
      db()->prepare('DELETE FROM post_likes WHERE id=?')->execute([$row['id']]);
      db()->prepare('UPDATE posts SET likes=likes-1 WHERE id=? AND likes>0')->execute([$pid]);
      respond(['liked' => false]);
    }
    db()->prepare('INSERT INTO post_likes(post_id,user_id) VALUES(?,?)')->execute([$pid, $u['id']]);
    db()->prepare('UPDATE posts SET likes=likes+1 WHERE id=?')->execute([$pid]);
    respond(['liked' => true]);
  }

  case preg_match('~^posts/(\d+)/comments$~', $route, $m) && $method === 'POST': {
    $u = require_auth();
    rate_limit('comment', (string)$u['id'], 30, 3600);
    $body = trim($in['body'] ?? '');
    if (mb_strlen($body) < 2) respond(['error' => 'Comment too short'], 422);
    db()->prepare('INSERT INTO comments(post_id,user_id,body) VALUES(?,?,?)')->execute([(int)$m[1], $u['id'], mb_substr($body, 0, 2000)]);
    respond(['ok' => true]);
  }

  case preg_match('~^posts/(\d+)/report$~', $route, $m) && $method === 'POST': {
    $u = require_auth();
    db()->prepare('INSERT INTO post_reports(post_id,user_id,reason) VALUES(?,?,?)')
       ->execute([(int)$m[1], $u['id'], mb_substr(trim($in['reason'] ?? ''), 0, 255)]);
    respond(['ok' => true]);
  }

  case preg_match('~^comments/(\d+)/report$~', $route, $m) && $method === 'POST': {
    $u = require_auth();
    db()->prepare('INSERT INTO post_reports(comment_id,user_id,reason) VALUES(?,?,?)')
       ->execute([(int)$m[1], $u['id'], mb_substr(trim($in['reason'] ?? ''), 0, 255)]);
    respond(['ok' => true]);
  }

  /* ================= ANNOUNCEMENTS (user side) ================= */
  case $route === 'announcements/pending' && $method === 'GET': {
    $u = require_auth();
    $now = date('Y-m-d H:i:s');
    $rows = db()->query("SELECT * FROM announcements WHERE active=1
      AND (start_at IS NULL OR start_at='' OR start_at<='$now')
      AND (end_at IS NULL OR end_at='' OR end_at>='$now') ORDER BY id DESC")->fetchAll();
    $show = [];
    foreach ($rows as $a) {
      $st = db()->prepare('SELECT * FROM announcement_views WHERE announcement_id=? AND user_id=?');
      $st->execute([$a['id'], $u['id']]);
      $v = $st->fetch();
      if ($v && $v['dismissed']) continue;
      $count = $v ? (int)$v['shown_count'] : 0;
      $last = $v ? (int)$v['last_shown_at'] : 0;
      $ok = match ($a['frequency']) {
        'once' => $count === 0,
        'daily' => time() - $last > 86400,
        'twice_daily' => time() - $last > 43200,
        'every_open' => true,
        default => $count === 0,
      };
      if ($ok) $show[] = $a;
    }
    respond(['items' => array_slice($show, 0, 2)]);
  }

  case preg_match('~^announcements/(\d+)/seen$~', $route, $m) && $method === 'POST': {
    $u = require_auth(); $aid = (int)$m[1];
    $dismiss = (int)($in['dismiss'] ?? 0);
    $st = db()->prepare('SELECT id FROM announcement_views WHERE announcement_id=? AND user_id=?');
    $st->execute([$aid, $u['id']]);
    if ($row = $st->fetch())
      db()->prepare('UPDATE announcement_views SET shown_count=shown_count+1, last_shown_at=?, dismissed=? WHERE id=?')
         ->execute([time(), $dismiss, $row['id']]);
    else
      db()->prepare('INSERT INTO announcement_views(announcement_id,user_id,shown_count,last_shown_at,dismissed) VALUES(?,?,1,?,?)')
         ->execute([$aid, $u['id'], time(), $dismiss]);
    respond(['ok' => true]);
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
    $g = setting('gemini_api_key', ''); $x = setting('groq_api_key', '') ?: setting('grok_api_key', '');
    $prov = setting('llm_provider', 'gemini'); if ($prov === 'grok') $prov = 'groq';
    respond(['dev_mode' => setting('dev_mode', '0'),
             'llm_provider' => $prov,
             'gemini_key_set' => $g !== '', 'gemini_key_masked' => $g ? substr($g, 0, 6) . '••••••••' : '',
             'groq_key_set' => $x !== '', 'groq_key_masked' => $x ? substr($x, 0, 6) . '••••••••' : '',
             'groq_model' => setting('groq_model', 'llama-3.3-70b-versatile'),
             'gemini_model' => setting('gemini_model', 'gemini-flash-latest')]);
  }
  case $route === 'admin/settings' && $method === 'POST': {
    require_admin();
    if (isset($in['gemini_api_key'])) set_setting('gemini_api_key', trim($in['gemini_api_key']));
    if (isset($in['groq_api_key'])) set_setting('groq_api_key', trim($in['groq_api_key']));
    if (isset($in['llm_provider']) && in_array($in['llm_provider'], ['gemini','groq'])) set_setting('llm_provider', $in['llm_provider']);
    if (isset($in['groq_model'])) set_setting('groq_model', trim($in['groq_model']));
    if (isset($in['gemini_model'])) set_setting('gemini_model', trim($in['gemini_model']));
    if (isset($in['dev_mode'])) set_setting('dev_mode', $in['dev_mode'] ? '1' : '0');
    respond(['ok' => true]);
  }

  case $route === 'admin/test-llm' && $method === 'POST': {
    require_admin();
    require_once __DIR__ . '/engine.php';
    $r = Engine::llmSecondOpinion('email', 'Hello please send me your credit card number to validate your account',
      ['verdict'=>'safe','risk'=>10,'threatType'=>'None','explanation'=>'rules baseline','recommendation'=>'-','subject'=>'test','meta'=>[]]);
    respond(['result' => $r, 'llm_used' => $r['meta']['llm'] ?? 'NONE — no working key configured']);
  }

  /* ---- admin: courses ---- */
  case $route === 'admin/courses' && $method === 'POST': {
    require_admin();
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($in['title'] ?? ''))) . '-' . random_int(10, 99);
    db()->prepare('INSERT INTO courses(slug,title,level,description,minutes,cover) VALUES(?,?,?,?,?,?)')
       ->execute([$slug, trim($in['title'] ?? 'Untitled'), $in['level'] ?? 'beginner',
                  trim($in['description'] ?? ''), (int)($in['minutes'] ?? 30), $in['cover'] ?? 'green']);
    respond(['ok' => true, 'id' => (int)db()->lastInsertId()]);
  }
  case preg_match('~^admin/courses/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    if (isset($in['active'])) db()->prepare('UPDATE courses SET active=? WHERE id=?')->execute([(int)$in['active'], (int)$m[1]]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/courses/(\d+)/lessons$~', $route, $m) && $method === 'POST': {
    require_admin();
    $cid = (int)$m[1];
    $pos = 1 + (int)db()->query("SELECT COALESCE(MAX(position),0) p FROM lessons WHERE course_id=$cid")->fetch()['p'];
    db()->prepare('INSERT INTO lessons(course_id,position,title,body_html,video_url) VALUES(?,?,?,?,?)')
       ->execute([$cid, $pos, trim($in['title'] ?? ''), $in['body_html'] ?? '', trim($in['video_url'] ?? '')]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/lessons/(\d+)$~', $route, $m) && $method === 'DELETE': {
    require_admin();
    db()->prepare('DELETE FROM lessons WHERE id=?')->execute([(int)$m[1]]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/courses/(\d+)/quiz$~', $route, $m) && $method === 'POST': {
    require_admin();
    db()->prepare('INSERT INTO quiz_questions(course_id,question,options_json,correct_index) VALUES(?,?,?,?)')
       ->execute([(int)$m[1], trim($in['question'] ?? ''), json_encode(array_values((array)($in['options'] ?? []))), (int)($in['correct_index'] ?? 0)]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/quiz/(\d+)$~', $route, $m) && $method === 'DELETE': {
    require_admin();
    db()->prepare('DELETE FROM quiz_questions WHERE id=?')->execute([(int)$m[1]]);
    respond(['ok' => true]);
  }

  /* ---- admin: community moderation ---- */
  case $route === 'admin/community' && $method === 'GET': {
    require_admin();
    respond([
      'posts' => db()->query("SELECT p.*, u.name author, u.email FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC LIMIT 100")->fetchAll(),
      'reports' => db()->query("SELECT r.*, u.name reporter FROM post_reports r JOIN users u ON u.id=r.user_id WHERE r.status='open' ORDER BY r.id DESC")->fetchAll(),
    ]);
  }
  case preg_match('~^admin/posts/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    if (isset($in['status']) && in_array($in['status'], ['active','hidden','removed']))
      db()->prepare('UPDATE posts SET status=? WHERE id=?')->execute([$in['status'], (int)$m[1]]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/comments/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    if (isset($in['status']) && in_array($in['status'], ['active','hidden','removed']))
      db()->prepare('UPDATE comments SET status=? WHERE id=?')->execute([$in['status'], (int)$m[1]]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/reports/(\d+)/resolve$~', $route, $m) && $method === 'POST': {
    require_admin();
    db()->prepare("UPDATE post_reports SET status='resolved' WHERE id=?")->execute([(int)$m[1]]);
    respond(['ok' => true]);
  }

  /* ---- admin: announcements ---- */
  case $route === 'admin/announcements' && $method === 'GET': {
    require_admin();
    respond(['items' => db()->query('SELECT * FROM announcements ORDER BY id DESC')->fetchAll()]);
  }
  case $route === 'admin/announcements' && $method === 'POST': {
    require_admin();
    db()->prepare('INSERT INTO announcements(title,body,category,level,media_url,media_type,frequency,start_at,end_at) VALUES(?,?,?,?,?,?,?,?,?)')
       ->execute([trim($in['title'] ?? ''), trim($in['body'] ?? ''), trim($in['category'] ?? 'General'),
                  in_array($in['level'] ?? '', ['info','warn','danger']) ? $in['level'] : 'info',
                  trim($in['media_url'] ?? ''), in_array($in['media_type'] ?? '', ['image','video']) ? $in['media_type'] : '',
                  in_array($in['frequency'] ?? '', ['once','daily','twice_daily','every_open']) ? $in['frequency'] : 'once',
                  trim($in['start_at'] ?? ''), trim($in['end_at'] ?? '')]);
    respond(['ok' => true]);
  }
  case preg_match('~^admin/announcements/(\d+)$~', $route, $m) && $method === 'PUT': {
    require_admin();
    if (isset($in['active'])) db()->prepare('UPDATE announcements SET active=? WHERE id=?')->execute([(int)$in['active'], (int)$m[1]]);
    respond(['ok' => true]);
  }

  case $route === 'admin/broadcast' && $method === 'POST': {
    require_admin();
    $users = db()->query('SELECT id FROM users')->fetchAll(PDO::FETCH_COLUMN);
    $st = db()->prepare('INSERT INTO notifications(user_id,type,title,body,from_admin) VALUES(?,?,?,?,1)');
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
