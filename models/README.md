# Database models

⚠️ **Do NOT import any .sql file to set up the database.**

The backend creates and seeds its own schema automatically:

1. Create an **empty** MySQL database named `sentinel_ai` in phpMyAdmin
2. Open the app (or `/api/health`) — all tables migrate + seed on first request

The authoritative schema lives in code: `api/bootstrap.php` → `migrate()`.

(An early draft schema.sql used to live here; it was removed because importing
it conflicts with the real backend's tables.)
