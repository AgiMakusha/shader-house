#!/bin/bash

# Wrapper script for cleanup-unverified-accounts.ts
# Can be used in cron jobs or scheduled tasks

# Navigate to project directory
cd "$(dirname "$0")/.."

# Run the cleanup script
npx tsx scripts/cleanup-unverified-accounts.ts "$@"

