#!/bin/bash

echo "Running Prisma generate..."
npx prisma generate

echo "Pushing database schema with data loss acceptance..."
npx prisma db push --accept-data-loss

echo "Seeding evaluation data..."
npx tsx scripts/seed-evaluation-data.ts

echo "Evaluation seeding process completed."
