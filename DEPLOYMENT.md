# Deployment Guide

This document explains how the CI/CD pipeline works for megadev.ai.

## Overview

The site automatically deploys to Hostinger when code is pushed to the `main` branch. The pipeline:

1. Runs tests
2. Builds the production bundle
3. Deploys via FTPS to Hostinger

## Pipeline Workflow

```
Push to main → Install deps → Run tests → Build → Deploy to Hostinger
```

## Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `FTP_SERVER` | Hostinger FTP hostname (e.g., `ftp.megadev.ai` or server IP) |
| `FTP_USERNAME` | FTP account username |
| `FTP_PASSWORD` | FTP account password |

### Finding Hostinger FTP Credentials

1. Log into [Hostinger hPanel](https://hpanel.hostinger.com)
2. Select your website/hosting plan
3. Navigate to **Files → FTP Accounts**
4. Create a dedicated FTP account for CI/CD (recommended)
5. Note the Host, Username, and Password

## Manual Deployment

To deploy a specific commit or branch manually:

1. Go to **Actions → Build and Deploy**
2. Click **Run workflow**
3. Enter the git ref (branch, tag, or SHA) to deploy
4. Click **Run workflow**

## Rollback

To rollback to a previous version:

**Option 1: Git revert (recommended)**
```bash
git revert HEAD
git push origin main
```

**Option 2: Manual deploy**
1. Find the commit SHA of the working version
2. Use manual deployment with that SHA

## Troubleshooting

### Workflow fails at "Deploy to Hostinger"

- Verify FTP credentials are correct in GitHub Secrets
- Check if FTPS is enabled (port 21)
- Ensure FTP account has write access to the target directory

### Tests fail

- Run `npm run test:run` locally to reproduce
- Check test output in GitHub Actions logs

### Build fails

- Run `npm run build` locally
- Check for TypeScript errors with `npx tsc --noEmit`

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow |
| `dist/` | Build output (not committed) |
| `public/.htaccess` | Apache configuration for SPA routing |

## Security Notes

- FTP credentials are stored as encrypted GitHub Secrets
- FTPS (encrypted FTP) is used for file transfer
- Create a dedicated FTP account with minimal permissions
