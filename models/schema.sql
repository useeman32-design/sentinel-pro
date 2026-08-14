-- ============================================================
-- SENTINEL AI — MySQL Schema (models only, backend comes later)
-- Target: MySQL 8.x / MariaDB 10.6+ (XAMPP compatible)
-- ============================================================

CREATE DATABASE IF NOT EXISTS sentinel_ai
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sentinel_ai;

-- ---------- USERS ----------
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)        NOT NULL,
  email         VARCHAR(190)        NOT NULL UNIQUE,
  password_hash VARCHAR(255)        NOT NULL,          -- bcrypt/argon2id
  company       VARCHAR(150)        NULL,
  role          ENUM('member','admin','analyst') NOT NULL DEFAULT 'member',
  plan          ENUM('free','pro','enterprise')  NOT NULL DEFAULT 'free',
  email_verified_at DATETIME        NULL,
  google_id     VARCHAR(64)         NULL UNIQUE,       -- OAuth
  avatar_url    VARCHAR(255)        NULL,
  status        ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- AUTH TOKENS (sessions, email verify, password reset) ----------
CREATE TABLE auth_tokens (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)  NOT NULL,                        -- sha256 of the token
  type       ENUM('session','email_verify','password_reset','api') NOT NULL,
  expires_at DATETIME  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tokens_lookup (token_hash, type)
) ENGINE=InnoDB;

-- ---------- SCANS (all scanner modules) ----------
CREATE TABLE scans (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('link','email','sms','qr','file','breach') NOT NULL,
  subject     TEXT            NOT NULL,                 -- URL / snippet / filename / email
  verdict     ENUM('safe','warn','danger') NOT NULL,
  risk_score  TINYINT UNSIGNED NOT NULL,                -- 0-100
  threat_type VARCHAR(150)    NULL,
  explanation TEXT            NULL,
  recommendation TEXT         NULL,
  raw_ai_json JSON            NULL,                     -- full Gemini response
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_scans_user_time (user_id, created_at),
  INDEX idx_scans_type (type)
) ENGINE=InnoDB;

-- ---------- SECURITY SCORE HISTORY ----------
CREATE TABLE score_history (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  score      TINYINT UNSIGNED NOT NULL,
  recorded_on DATE   NOT NULL,
  CONSTRAINT fk_score_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_score_day (user_id, recorded_on)
) ENGINE=InnoDB;

-- ---------- LOGIN HISTORY ----------
CREATE TABLE login_history (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  ip_address VARCHAR(45)  NULL,
  user_agent VARCHAR(255) NULL,
  city       VARCHAR(80)  NULL,
  country    CHAR(2)      NULL,
  success    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_login_user_time (user_id, created_at)
) ENGINE=InnoDB;

-- ---------- BREACH RECORDS ----------
CREATE TABLE breach_checks (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  email      VARCHAR(190) NOT NULL,
  breached   TINYINT(1)   NOT NULL,
  breaches_json JSON      NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_breach_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- REPORTS ----------
CREATE TABLE reports (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  ref        VARCHAR(20)  NOT NULL UNIQUE,              -- e.g. RPT-2041
  title      VARCHAR(180) NOT NULL,
  risk_level ENUM('low','medium','high') NOT NULL,
  threat_count INT UNSIGNED NOT NULL DEFAULT 0,
  summary    TEXT NULL,
  body_json  JSON NULL,                                 -- structured sections
  status     ENUM('ready','archived') NOT NULL DEFAULT 'ready',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- NOTIFICATIONS ----------
CREATE TABLE notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       ENUM('danger','warn','info','ok') NOT NULL DEFAULT 'info',
  title      VARCHAR(180) NOT NULL,
  body       TEXT NULL,
  read_at    DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_unread (user_id, read_at)
) ENGINE=InnoDB;

-- ---------- THREAT INTEL FEED (admin-curated + AI-ingested) ----------
CREATE TABLE threat_intel (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level      ENUM('danger','warn','info') NOT NULL,
  title      VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category   VARCHAR(60)  NOT NULL,                     -- Phishing, Malware, ...
  region     CHAR(2)      NOT NULL DEFAULT 'NG',
  source_url VARCHAR(255) NULL,
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_intel_region_active (region, active, published_at)
) ENGINE=InnoDB;

-- ---------- TRAINING ----------
CREATE TABLE courses (
  id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug     VARCHAR(60)  NOT NULL UNIQUE,
  title    VARCHAR(180) NOT NULL,
  level    ENUM('beginner','intermediate','advanced') NOT NULL,
  description TEXT NULL,
  minutes  INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE lessons (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  position  INT UNSIGNED NOT NULL,
  title     VARCHAR(180) NOT NULL,
  video_url VARCHAR(255) NULL,
  body_html MEDIUMTEXT   NULL,
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lesson_pos (course_id, position)
) ENGINE=InnoDB;

CREATE TABLE quiz_questions (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  question  TEXT NOT NULL,
  options_json JSON NOT NULL,                            -- ["A","B","C","D"]
  correct_index TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE course_progress (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id   BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  percent   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  quiz_score TINYINT UNSIGNED NULL,
  certificate_ref VARCHAR(40) NULL UNIQUE,
  completed_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prog_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prog_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_prog (user_id, course_id)
) ENGINE=InnoDB;

-- ---------- AI CHAT HISTORY ----------
CREATE TABLE chat_messages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  role       ENUM('user','ai') NOT NULL,
  content    MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_user_time (user_id, created_at)
) ENGINE=InnoDB;

-- ---------- API KEYS (user-managed) ----------
CREATE TABLE api_keys (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  label      VARCHAR(80) NOT NULL,
  key_hash   CHAR(64)    NOT NULL UNIQUE,
  last_used_at DATETIME  NULL,
  revoked_at DATETIME    NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_apikeys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
