<?php
/* ============================================================
   SENTINEL AI — Real analysis engine
   URL: live DNS resolution, HTTPS probe, redirect tracing,
        blocklist, brand impersonation, structural heuristics.
   Email/SMS: DB-driven signature engine (admin-manageable).
   Files: magic-byte inspection, extension mismatch, macro/
        executable detection inside OOXML/ZIP.
   ============================================================ */
require_once __DIR__ . '/bootstrap.php';

final class Engine {

  /* ---------------- URL / LINK ---------------- */
  static function scanUrl(string $url): array {
    $url = trim($url);
    if (!preg_match('~^https?://~i', $url)) $url = 'http://' . $url;
    $p = parse_url($url);
    $host = strtolower($p['host'] ?? '');
    if (!$host) return self::result('warn', 50, 'Invalid URL', 'The URL could not be parsed.', 'Check the address and try again.', $url);

    $score = 0; $signals = []; $meta = ['host' => $host];

    // 1) blocklist (admin-managed)
    $bl = db()->query("SELECT pattern FROM blocklist WHERE enabled=1 AND type='domain'")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($bl as $b) if ($b && (str_contains($host, strtolower($b)) || fnmatch($b, $host))) {
      return self::result('danger', 97, 'Confirmed Malicious (Blocklisted)',
        "The domain {$host} is on Sentinel's confirmed-threat blocklist.",
        'Do NOT visit this link. Block the sender and report to ngCERT (cert.gov.ng).', $url, ['blocklisted' => true]);
    }

    // 2) live DNS resolution
    $ips = @gethostbynamel($host) ?: [];
    $meta['resolved'] = $ips;
    if (!$ips) { $score += 25; $signals[] = 'Domain does not resolve (possibly taken down or newly registered)'; }

    // 3) structure heuristics
    if (!preg_match('~^https://~i', $url)) { $score += 15; $signals[] = 'No HTTPS encryption'; }
    if (preg_match('/@/', $p['user'] ?? '') || str_contains($url, '@')) { $score += 22; $signals[] = 'Contains "@" credential-trick'; }
    if (filter_var($host, FILTER_VALIDATE_IP)) { $score += 24; $signals[] = 'Raw IP address instead of a domain'; }
    if (preg_match('/(\.tk|\.ml|\.ga|\.cf|\.gq|\.xyz|\.top|\.club|\.icu|\.cam)$/', $host)) { $score += 15; $signals[] = 'Abuse-prone free/cheap TLD'; }
    if (substr_count($host, '-') > 3) { $score += 8; $signals[] = 'Excessive hyphens in domain'; }
    if (substr_count($host, '.') > 3) { $score += 8; $signals[] = 'Deeply nested subdomains'; }
    if (strlen($url) > 100) { $score += 6; $signals[] = 'Unusually long URL'; }
    if (preg_match('/(bit\.ly|tinyurl|t\.co|cutt\.ly|rb\.gy|shorturl|is\.gd)/', $host)) { $score += 14; $signals[] = 'URL shortener hides destination'; }
    if (preg_match('/xn--/', $host)) { $score += 20; $signals[] = 'Punycode domain (possible homograph attack)'; }

    // 4) URL keyword signatures from DB
    foreach (self::signatures('url') as $sig)
      if (@preg_match($sig['pattern'], $url)) { $score += (int)$sig['weight']; $signals[] = $sig['category']; break; }

    // 5) brand impersonation (against admin-managed official domains)
    $brands = db()->query('SELECT official_domains FROM brands')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($brands as $bjson) {
      foreach ((array)json_decode($bjson, true) as $brand => $official) {
        if (str_contains($host, $brand) && !str_ends_with($host, $official)) {
          $score += 32; $signals[] = "Impersonates '{$brand}' (official: {$official})"; break 2;
        }
      }
    }

    // 6) live HTTP probe with redirect trace (only if it resolves)
    if ($ips && function_exists('curl_init')) {
      $ch = curl_init($url);
      curl_setopt_array($ch, [CURLOPT_NOBODY=>true, CURLOPT_FOLLOWLOCATION=>true, CURLOPT_MAXREDIRS=>5,
        CURLOPT_TIMEOUT=>6, CURLOPT_CONNECTTIMEOUT=>4, CURLOPT_RETURNTRANSFER=>true,
        CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_USERAGENT=>'SentinelAI-Scanner/1.0']);
      curl_exec($ch);
      $info = curl_getinfo($ch);
      $sslOk = curl_errno($ch) !== CURLE_SSL_CACERT && curl_errno($ch) !== CURLE_PEER_FAILED_VERIFICATION;
      $meta['http_code'] = $info['http_code']; $meta['redirects'] = $info['redirect_count']; $meta['final_url'] = $info['url'];
      if (!$sslOk) { $score += 20; $signals[] = 'Invalid or untrusted TLS certificate'; }
      if (($info['redirect_count'] ?? 0) >= 3) { $score += 12; $signals[] = "Long redirect chain ({$info['redirect_count']} hops)"; }
      $finalHost = strtolower(parse_url($info['url'] ?? '', PHP_URL_HOST) ?? '');
      if ($finalHost && $finalHost !== $host) { $meta['landed_on'] = $finalHost; $signals[] = "Redirects to different domain: {$finalHost}"; $score += 8; }
      curl_close($ch);
    }

    $risk = max(2, min(98, $score + 4));
    $verdict = $risk >= 65 ? 'danger' : ($risk >= 35 ? 'warn' : 'safe');
    return self::result($verdict, $risk,
      $verdict==='danger' ? 'Phishing / Malicious Infrastructure' : ($verdict==='warn' ? 'Suspicious Characteristics' : 'None Detected'),
      $signals ? 'Flagged signals: ' . implode('; ', array_unique($signals)) . '.' : 'Live DNS, TLS and structural analysis found no red flags for this URL.',
      $verdict==='danger' ? 'Do NOT visit this link or enter credentials. Report to ngCERT (cert.gov.ng).' :
      ($verdict==='warn' ? 'Proceed with caution — verify the domain spelling and avoid entering sensitive data.' :
       'This link appears safe. Always double-check the domain before entering credentials.'),
      $url, $meta);
  }

  /* ---------------- EMAIL / SMS (signature engine) ---------------- */
  static function scanText(string $channel, string $content): array {
    $score = 5; $hits = []; $cats = [];
    foreach (self::signatures($channel) as $sig) {
      if (@preg_match($sig['pattern'], $content)) {
        $score += (int)$sig['weight'];
        $hits[] = $sig['category'];
        $cats[$sig['category']] = true;
      }
    }
    // embedded URLs get the full URL engine treatment
    if (preg_match_all('~https?://[^\s<>"\']+~i', $content, $m)) {
      foreach (array_slice($m[0], 0, 3) as $u) {
        $r = self::scanUrl($u);
        if ($r['verdict'] === 'danger') { $score += 30; $hits[] = 'Contains confirmed-malicious link (' . parse_url($u, PHP_URL_HOST) . ')'; }
        elseif ($r['verdict'] === 'warn') { $score += 12; $hits[] = 'Contains suspicious link'; }
      }
    }
    $risk = max(2, min(98, $score));
    $verdict = $risk >= ($channel==='sms' ? 55 : 60) ? 'danger' : ($risk >= 32 ? 'warn' : 'safe');
    $label = $channel === 'sms' ? 'SMS' : 'email';
    return self::result($verdict, $risk,
      $hits ? implode(' + ', array_slice(array_keys($cats), 0, 3)) : 'None Detected',
      $hits ? 'Detected indicators: ' . implode('; ', array_unique($hits)) . '.' : "No scam signatures, credential requests or malicious links detected in this {$label}.",
      $verdict==='danger' ? "Do not reply or click links in this {$label}. Report to your bank via official channels and forward SMS scams to 7726." :
      ($verdict==='warn' ? 'Verify the sender through an official channel before acting on this message.' :
       'Message appears clean. Banks never ask for full BVN, PIN or OTP.'),
      mb_substr($content, 0, 120) . (mb_strlen($content) > 120 ? '…' : ''));
  }

  /* ---------------- FILE (magic bytes + container inspection) ---------------- */
  static function scanFile(string $name, string $tmpPath): array {
    $size = filesize($tmpPath);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $fh = fopen($tmpPath, 'rb'); $head = fread($fh, 8) ?: ''; fclose($fh);
    $hash = hash_file('sha256', $tmpPath);
    $meta = ['sha256' => $hash, 'size' => $size, 'ext' => $ext];
    $score = 4; $signals = [];

    $magic = [
      'MZ' => 'exe', "\x7FELF" => 'elf', '%PDF' => 'pdf', "PK\x03\x04" => 'zip',
      "\xD0\xCF\x11\xE0" => 'ole', "\x89PNG" => 'png', "\xFF\xD8\xFF" => 'jpg', 'GIF8' => 'gif',
    ];
    $realType = 'unknown';
    foreach ($magic as $sig => $t) if (str_starts_with($head, $sig)) { $realType = $t; break; }
    $meta['detected_type'] = $realType;

    // executables
    if (in_array($realType, ['exe', 'elf'])) { $score += 70; $signals[] = 'File is a native executable (' . strtoupper($realType) . ' header)'; }
    $dangerExt = ['exe','scr','bat','cmd','vbs','js','jar','msi','apk','ps1','hta'];
    if (in_array($ext, $dangerExt)) { $score += 40; $signals[] = "Dangerous extension .{$ext}"; }

    // extension mismatch (disguised file)
    $extMap = ['pdf'=>'pdf','png'=>'png','jpg'=>'jpg','jpeg'=>'jpg','gif'=>'gif','zip'=>'zip','docx'=>'zip','xlsx'=>'zip','pptx'=>'zip','doc'=>'ole','xls'=>'ole','ppt'=>'ole'];
    if (isset($extMap[$ext]) && $realType !== 'unknown' && $extMap[$ext] !== $realType) {
      $score += 45; $signals[] = "Extension .{$ext} does not match actual content ({$realType}) — disguised file";
    }

    // inspect OOXML/ZIP containers for macros & executables
    if ($realType === 'zip' && class_exists('ZipArchive')) {
      $z = new ZipArchive();
      if ($z->open($tmpPath) === true) {
        $inner = [];
        for ($i = 0; $i < min($z->numFiles, 200); $i++) $inner[] = strtolower($z->getNameIndex($i));
        if (array_filter($inner, fn($f) => str_contains($f, 'vbaproject.bin'))) { $score += 45; $signals[] = 'Contains VBA macros (vbaProject.bin)'; }
        $badInner = array_filter($inner, fn($f) => preg_match('/\.(exe|scr|bat|vbs|js|jar|cmd|ps1)$/', $f));
        if ($badInner) { $score += 50; $signals[] = 'Archive contains executable: ' . implode(', ', array_slice($badInner, 0, 3)); }
        if (array_filter($inner, fn($f) => str_contains($f, '..'))) { $score += 30; $signals[] = 'Path traversal entries (zip-slip attack)'; }
        $z->close();
      }
    }
    // legacy Office (OLE) — may contain macros, can't verify without deep parse
    if ($realType === 'ole') { $score += 18; $signals[] = 'Legacy Office format — may contain macros (cannot fully verify)'; }
    // PDF with JavaScript or launch actions
    if ($realType === 'pdf') {
      $chunk = file_get_contents($tmpPath, false, null, 0, min($size, 2_000_000));
      if (preg_match('/\/(JavaScript|JS)\b/', $chunk)) { $score += 30; $signals[] = 'PDF contains embedded JavaScript'; }
      if (preg_match('/\/Launch\b/', $chunk)) { $score += 35; $signals[] = 'PDF contains Launch action (can execute files)'; }
      if (preg_match('/\/OpenAction\b/', $chunk)) { $score += 12; $signals[] = 'PDF auto-runs an action on open'; }
    }

    $risk = max(2, min(98, $score));
    $verdict = $risk >= 60 ? 'danger' : ($risk >= 30 ? 'warn' : 'safe');
    return self::result($verdict, $risk,
      $verdict==='danger' ? 'Potentially Malicious File' : ($verdict==='warn' ? 'Requires Caution' : 'None Detected'),
      $signals ? 'Static analysis findings: ' . implode('; ', $signals) . '.' : 'Magic-byte, structure and container analysis found no macros, executables, disguises or exploit patterns.',
      $verdict==='danger' ? 'Do not open this file. Delete it and run a full antivirus scan if already opened.' :
      ($verdict==='warn' ? 'Open only if you fully trust the sender. Consider scanning with an updated antivirus first.' :
       'File appears clean. SHA-256 recorded for audit.'),
      $name . ' (' . number_format($size / 1024, 1) . ' KB)', $meta);
  }

  /* ---------------- BREACH ---------------- */
  static function breachCheck(string $email): array {
    $h = hash('sha256', strtolower(trim($email)));
    $st = db()->prepare('SELECT b.* FROM breach_emails be JOIN breaches b ON b.id=be.breach_id WHERE be.email_hash=?');
    $st->execute([$h]);
    $found = $st->fetchAll();
    // dev mode: deterministic demo results until real breach corpus is loaded
    if (!$found && setting('dev_mode') === '1') {
      $n = array_sum(array_map('ord', str_split($email)));
      if ($n % 3 !== 0) {
        $all = db()->query('SELECT * FROM breaches')->fetchAll();
        $found = array_slice($all, 0, 1 + $n % count($all));
      }
    }
    return ['breached' => count($found) > 0, 'breaches' => array_map(fn($b) => [
      'name'=>$b['name'],'date'=>$b['breach_date'],'data'=>$b['data_types'],'records'=>$b['records']], $found),
      'recommendation' => $found ?
        'Change the password on every account using this email — especially email itself and banking. Enable 2FA everywhere and never reuse passwords.' :
        'No exposure found in known public breaches. Keep using unique passwords and enable 2FA as standard practice.'];
  }

  /* ---------------- shared ---------------- */
  static function signatures(string $channel): array {
    $st = db()->prepare('SELECT category,pattern,weight FROM signatures WHERE channel=? AND enabled=1');
    $st->execute([$channel]);
    return $st->fetchAll();
  }
  static function result(string $verdict, int $risk, string $threatType, string $explanation, string $recommendation, string $subject, array $meta = []): array {
    return compact('verdict','risk','threatType','explanation','recommendation','subject') + ['meta' => $meta];
  }
}
