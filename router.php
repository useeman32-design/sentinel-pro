<?php
/* Router for PHP built-in server:  php -S 0.0.0.0:3000 router.php
   Serves the SPA statics and routes /api/* to the backend.
   (On XAMPP/Apache, .htaccess does this instead.) */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (preg_match('~^/api(/|$)~', $uri)) { require __DIR__ . '/api/index.php'; return true; }
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && !is_dir($file)) return false; // serve static file
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
