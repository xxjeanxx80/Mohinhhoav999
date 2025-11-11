# Database Migrations

This folder contains SQL migration files for database schema changes.

## Migration Files

1. **add-avatar-fields.sql** - Adds `tag` column to `media` table for avatar/background/gallery differentiation
2. **add-spa-location-index.sql** - Creates index on spa location (latitude, longitude) for performance
3. **add-bank-account-fields.sql** - Adds bank account fields (`bank_name`, `bank_account_number`, `bank_account_holder`) to `users` table for owner payouts

## How to Run Migrations

### Option 1: Run All Migrations (Recommended)

**Windows:**
```bash
cd Backend
migrations\run-all-migrations.bat
```

**Linux/Mac:**
```bash
cd Backend
chmod +x migrations/run-all-migrations.sh
./migrations/run-all-migrations.sh
```

### Option 2: Run Individual Migrations

**Using psql:**
```bash
# Migration 1: Avatar fields
psql -U postgres -d postgres -f migrations/add-avatar-fields.sql

# Migration 2: Spa location index
psql -U postgres -d postgres -f migrations/add-spa-location-index.sql

# Migration 3: Bank account fields (NEW - Required for payout feature)
psql -U postgres -d postgres -f migrations/add-bank-account-fields.sql
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to your database
3. Right-click database → Query Tool
4. Open and execute each migration file one by one

### Option 3: Run via SQL Command

```sql
-- Copy and paste the content of each migration file into pgAdmin Query Tool
-- Or run in psql:
\i migrations/add-avatar-fields.sql
\i migrations/add-spa-location-index.sql
\i migrations/add-bank-account-fields.sql
```

## Migration Order

All migrations are **independent** and can be run in any order. However, recommended order:
1. `add-avatar-fields.sql` (if you need media tagging)
2. `add-spa-location-index.sql` (performance optimization)
3. `add-bank-account-fields.sql` (required for payout feature)

## Verification

After running migrations, verify they were applied:

```sql
-- Check avatar fields
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'media' AND column_name = 'tag';

-- Check spa index
SELECT indexname FROM pg_indexes 
WHERE tablename = 'spas' AND indexname LIKE '%location%';

-- Check bank account fields
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('bank_name', 'bank_account_number', 'bank_account_holder');
```

## Notes

- All migrations use `IF NOT EXISTS` so they are safe to run multiple times
- Migrations are idempotent (can be run multiple times without errors)
- Always backup your database before running migrations in production

