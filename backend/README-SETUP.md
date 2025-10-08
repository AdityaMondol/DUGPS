# Backend Setup Guide

## PostgreSQL Not Running Error Fix

If you see `ECONNREFUSED 127.0.0.1:5432`, PostgreSQL is not running.

### Steps to Start PostgreSQL:

1. **Find your PostgreSQL service name:**
   - Open Services (Win + R, type `services.msc`)
   - Look for "postgresql" service
   - Note the exact service name (e.g., `postgresql-x64-16`, `postgresql-16`, etc.)

2. **Start PostgreSQL:**
   ```powershell
   # Replace SERVICE_NAME with your actual service name
   net start SERVICE_NAME
   ```

3. **Run database setup:**
   ```bash
   cd backend
   npm run setup-db
   ```

### Alternative: Use pgAdmin or PostgreSQL bin folder

If net start doesn't work:
```powershell
# Navigate to PostgreSQL bin folder (adjust version as needed)
cd "C:\Program Files\PostgreSQL\16\bin"
.\pg_ctl.exe start -D "C:\Program Files\PostgreSQL\16\data"
```

## After PostgreSQL is Running

Run the database setup:
```bash
cd backend
npm run setup-db
npm run dev
```
