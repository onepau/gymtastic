-- Migration: add image_url column to pages table
-- Run once against local and remote D1:
--   npx wrangler d1 execute gymtastic-db --local --file=../migrate-add-image-url.sql
--   npx wrangler d1 execute gymtastic-db --file=../migrate-add-image-url.sql

ALTER TABLE pages ADD COLUMN image_url TEXT;
