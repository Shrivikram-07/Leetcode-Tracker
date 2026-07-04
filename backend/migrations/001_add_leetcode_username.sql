-- Migration: Add leetcode_username to users table
-- Description: This migration adds the leetcode_username column which will be used to sync data with alfa-leetcode-api

ALTER TABLE users 
ADD COLUMN leetcode_username VARCHAR(100) DEFAULT NULL;
