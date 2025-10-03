-- Initialize PostgreSQL database for Internship System
-- This file will be executed when the PostgreSQL container starts

-- Create additional databases if needed
-- CREATE DATABASE internship_system_test;
-- CREATE DATABASE internship_system_prod;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Asia/Bangkok';