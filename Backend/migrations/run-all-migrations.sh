#!/bin/bash
# Script to run all migrations in order

DB_NAME="beauty_booking_hub"
DB_USER="postgres"

echo "Running all migrations..."

# Migration 1: Add avatar fields
echo "1. Running add-avatar-fields.sql..."
psql -U $DB_USER -d $DB_NAME -f migrations/add-avatar-fields.sql

# Migration 2: Add spa location index
echo "2. Running add-spa-location-index.sql..."
psql -U $DB_USER -d $DB_NAME -f migrations/add-spa-location-index.sql

# Migration 3: Add bank account fields
echo "3. Running add-bank-account-fields.sql..."
psql -U $DB_USER -d $DB_NAME -f migrations/add-bank-account-fields.sql

echo "All migrations completed!"

