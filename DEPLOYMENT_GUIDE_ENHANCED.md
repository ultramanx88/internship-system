# 🚀 Enhanced Deployment Guide

## Overview
This guide explains the enhanced deployment scripts with the correct workflow: **Build → Push → Deploy → (Export/Sync if needed)**

## Available Scripts

### 1. 🎯 Main Deployment Script (`deploy.sh`)
**Interactive menu with all deployment options**

```bash
./deploy.sh                    # Show interactive menu
./deploy.sh code-only          # Code-only deployment
./deploy.sh full               # Full deployment with DB
./deploy.sh data-sync          # Data sync deployment
./deploy.sh quick              # Quick deployment (skip tests)
./deploy.sh export             # Export database only
./deploy.sh custom             # Custom deployment options
./deploy.sh help               # Show help
```

### 2. ⚡ Quick Deployment (`quick-deploy.sh`)
**Fastest deployment for urgent fixes**

```bash
./quick-deploy.sh
```

**What it does:**
- Kills processes on port 8080
- Builds application
- Commits and pushes changes
- Deploys to VPS
- Restarts application

### 3. 🔧 Enhanced Deployment (`deploy-enhanced.sh`)
**Full-featured deployment with all options**

```bash
./deploy-enhanced.sh --type code-only --commit-msg "Fix UI bug"
./deploy-enhanced.sh --type full --backup-db --commit-msg "Add new feature"
./deploy-enhanced.sh --type data-sync --export-db --sync-data
```

## Deployment Types

### 📝 Code-Only Deployment
**For UI changes, API updates, bug fixes**

```bash
./deploy.sh code-only
# or
./deploy-enhanced.sh --type code-only
```

**Workflow:**
1. ✅ Pre-deployment checks
2. ✅ Update dependencies
3. ✅ Run tests
4. ✅ Build application (LOCAL)
5. ✅ Git operations (PUSH)
6. ✅ Deploy to VPS
7. ⏭️ Skip database operations
8. ⏭️ Skip data sync

### 🗄️ Full Deployment
**For database schema changes, new features**

```bash
./deploy.sh full
# or
./deploy-enhanced.sh --type full --backup-db
```

**Workflow:**
1. ✅ Pre-deployment checks
2. ✅ Database backup/export
3. ✅ Update dependencies
4. ✅ Run tests
5. ✅ Build application (LOCAL)
6. ✅ Git operations (PUSH)
7. ✅ Deploy to VPS (with DB migrations)
8. ⏭️ Skip data sync

### 🔄 Data Sync Deployment
**For data synchronization between local and VPS**

```bash
./deploy.sh data-sync
# or
./deploy-enhanced.sh --type data-sync --export-db --sync-data
```

**Workflow:**
1. ✅ Pre-deployment checks
2. ✅ Database backup/export
3. ✅ Update dependencies
4. ✅ Run tests
5. ✅ Build application (LOCAL)
6. ✅ Git operations (PUSH)
7. ✅ Deploy to VPS
8. ✅ Data synchronization

## Command Line Options

### Enhanced Deployment Options

| Option | Description | Example |
|--------|-------------|---------|
| `--type` | Deployment type | `--type code-only` |
| `--env` | Environment | `--env production` |
| `--skip-tests` | Skip running tests | `--skip-tests` |
| `--skip-build` | Skip build process | `--skip-build` |
| `--force` | Force deployment | `--force` |
| `--backup-db` | Create DB backup | `--backup-db` |
| `--export-db` | Export database | `--export-db` |
| `--sync-data` | Sync data | `--sync-data` |
| `--commit-msg` | Custom commit message | `--commit-msg "Fix bug"` |

### Examples

```bash
# Code-only deployment
./deploy-enhanced.sh --type code-only --commit-msg "Fix UI bug"

# Full deployment with backup
./deploy-enhanced.sh --type full --backup-db --commit-msg "Add new feature"

# Data sync deployment
./deploy-enhanced.sh --type data-sync --export-db --sync-data

# Quick deployment (skip tests)
./deploy-enhanced.sh --type code-only --skip-tests --force

# Custom deployment
./deploy-enhanced.sh --type full --backup-db --skip-tests --commit-msg "Hotfix"
```

## Correct Workflow

### ❌ Wrong Workflow (Old):
```
Export db > Build > Push > Deploy > Sync
```

### ✅ Correct Workflow (New):
```
1. Build (LOCAL) → 2. Push (GIT) → 3. Deploy (VPS) → 4. (Export/Sync if needed)
```

## When to Use Each Script

| Scenario | Script | Reason |
|----------|--------|--------|
| UI/UX changes | `./deploy.sh code-only` | No DB changes needed |
| Bug fixes | `./deploy.sh code-only` | Quick fix, no DB changes |
| New features | `./deploy.sh full` | May have DB schema changes |
| Database changes | `./deploy.sh full` | Schema updates required |
| Data migration | `./deploy.sh data-sync` | Need to sync data |
| Emergency fixes | `./quick-deploy.sh` | Fastest deployment |
| Complex deployment | `./deploy-enhanced.sh` | Full control over options |

## Prerequisites

- `sshpass` installed (`brew install sshpass`)
- `jq` installed (`brew install jq`)
- SSH access to VPS configured
- Git repository access
- Node.js and npm installed

## Health Checks

After deployment, check:
- **Application URL**: http://203.170.129.199:8080
- **Health endpoint**: http://203.170.129.199:8080/api/health
- **PM2 status**: `pm2 status` on VPS

## Troubleshooting

### Common Issues

1. **Port 8080 in use**
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. **Git conflicts**
   - Scripts handle this automatically
   - Manual: `git stash` then `git pull`

3. **Build failures**
   - Check TypeScript errors locally first
   - Run `npm run typecheck` and `npm run lint`

4. **PM2 issues**
   - Scripts restart PM2 automatically
   - Manual: `pm2 restart internship-system`

5. **Database connection issues**
   - Check `.env.production` file
   - Verify PostgreSQL is running on VPS

### Debug Commands

```bash
# Check PM2 status
ssh root@203.170.129.199 "pm2 status"

# Check application logs
ssh root@203.170.129.199 "pm2 logs internship-system"

# Check port status
ssh root@203.170.129.199 "ss -ltnp | grep :8080"

# Test application
curl http://203.170.129.199:8080/api/health
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   ```

2. **Use appropriate deployment type**
   - Code changes: `code-only`
   - DB changes: `full`
   - Data sync: `data-sync`

3. **Create meaningful commit messages**
   ```bash
   ./deploy.sh --commit-msg "Fix: Resolve dropdown address condition logic"
   ```

4. **Monitor after deployment**
   - Check health endpoint
   - Monitor logs
   - Test critical functionality

5. **Keep backups**
   - Use `--backup-db` for important deployments
   - Export data before major changes

## Quick Reference

### Most Common Commands:
```bash
# Quick fix
./quick-deploy.sh

# Regular code update
./deploy.sh code-only

# New feature with DB changes
./deploy.sh full

# Data synchronization
./deploy.sh data-sync

# Interactive menu
./deploy.sh
```

### Emergency Commands:
```bash
# Kill port 8080
lsof -ti:8080 | xargs kill -9

# Quick restart
./quick-deploy.sh

# Force deploy
./deploy-enhanced.sh --type code-only --force --skip-tests
```
