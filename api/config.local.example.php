<?php
/* ============================================================
   SENTINEL AI — Local configuration overrides
   ------------------------------------------------------------
   1. COPY this file to:  api/config.local.php
   2. Edit your values below.
   config.local.php is git-ignored, so your settings survive
   every `git pull` with zero merge conflicts.
   ============================================================ */
return [
  'mysql' => [
    'host' => '127.0.0.1',
    'db'   => 'sentinel_ai',
    'user' => 'root',
    'pass' => '',           // XAMPP default is empty
  ],
];
