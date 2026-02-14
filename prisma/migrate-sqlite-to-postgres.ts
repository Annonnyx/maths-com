export {};

// This script is only intended to be run locally for one-off data migrations.
// It depends on optional Prisma adapters that are not installed in production builds.
// The actual migration to Supabase has been completed using SQL dumps.

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

console.log('This migration script is disabled in production builds.');
