# 🚀 Deployment Scripts Guide

## Overview
This guide explains the different deployment scripts available for the internship system.

## Available Scripts

### 1. 🚀 Full Deploy (`pull-deploy.sh`)
**What it does:**
- Commits and pushes local changes to GitHub
- Pulls latest code to VPS
- Runs database migrations (Step 3)
- Builds and restarts the application

**When to use:**
- When you have database schema changes
- When you want to ensure VPS has the latest data structure
- For major updates or new features

**Usage:**
```bash
./scripts/pull-deploy.sh
```

### 2. 📦 Code-Only Deploy (`pull-deploy-code-only.sh`)
**What it does:**
- Commits and pushes local changes to GitHub
- Pulls latest code to VPS
- Skips database migrations
- Builds and restarts the application

**When to use:**
- When you only have code changes (UI, API logic, etc.)
- When database structure hasn't changed
- For quick bug fixes or minor updates

**Usage:**
```bash
./scripts/pull-deploy-code-only.sh
```

### 3. 🔄 Quick Deploy (`quick-deploy.sh`)
**What it does:**
- Basic deployment without git operations
- Assumes code is already pushed
- Minimal steps for fast deployment

**When to use:**
- When code is already committed and pushed
- For emergency fixes
- When you want minimal deployment steps

**Usage:**
```bash
./scripts/quick-deploy.sh
```

### 4. 🧠 Smart Deploy (`perfect-deploy.sh`)
**What it does:**
- Comprehensive deployment with error detection
- Interactive menu with multiple options
- Data comparison between local and VPS
- Auto-fix capabilities

**When to use:**
- For complex deployments
- When you need data synchronization
- When you want maximum control and visibility

**Usage:**
```bash
./scripts/perfect-deploy.sh
```

### 5. 🎯 Deploy Menu (`deploy-menu.sh`)
**What it does:**
- Interactive menu to choose deployment type
- Easy access to all deployment options
- User-friendly interface

**When to use:**
- When you're not sure which deployment type to use
- For regular development workflow
- When you want to see all options

**Usage:**
```bash
./scripts/deploy-menu.sh
```

## Database Migrations (Step 3)

### Do I need to run database migrations every time?

**YES for Full Deploy:**
- Always runs `npx prisma db push --accept-data-loss`
- Ensures VPS database matches your Prisma schema
- Safe to run multiple times

**NO for Code-Only Deploy:**
- Skips database migrations
- Only updates code and restarts application
- Use when database structure hasn't changed

### When to use each approach:

| Scenario | Script | Database Migrations |
|----------|--------|-------------------|
| New features with DB changes | `pull-deploy.sh` | ✅ Yes |
| Bug fixes in code only | `pull-deploy-code-only.sh` | ❌ No |
| UI/UX improvements | `pull-deploy-code-only.sh` | ❌ No |
| API endpoint changes | `pull-deploy-code-only.sh` | ❌ No |
| New database tables/fields | `pull-deploy.sh` | ✅ Yes |
| Prisma schema updates | `pull-deploy.sh` | ✅ Yes |

## Quick Reference

### Most Common Commands:
```bash
# For code changes only
./scripts/pull-deploy-code-only.sh

# For database changes
./scripts/pull-deploy.sh

# Interactive menu
./scripts/deploy-menu.sh
```

### Prerequisites:
- `sshpass` installed (`brew install sshpass`)
- `jq` installed (`brew install jq`)
- SSH access to VPS configured
- Git repository access

## Troubleshooting

### Common Issues:
1. **Port 8080 in use**: Kill existing processes first
2. **Git conflicts**: Scripts handle this automatically with `git stash`
3. **Build failures**: Check for TypeScript errors locally first
4. **PM2 issues**: Scripts will restart PM2 automatically

### Health Check:
After deployment, check: http://203.170.129.199:8080/api/health

Should return: `{"success":true,"status":"healthy","database":"connected"}`
