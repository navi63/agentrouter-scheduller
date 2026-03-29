# PM2 Deployment Guide

This guide explains how to deploy the Agent Router Scheduler application using PM2 process manager.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

Before deploying with PM2, ensure you have:

- **Node.js** v20.0.0 or higher
- **npm** v10.0.0 or higher
- **PM2** installed globally
- **PostgreSQL** database (local, Neon, Supabase, or managed)
- **Linux/macOS server** (PM2 works best on Unix-based systems)

### Check Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PM2 installation
pm2 --version

# Check PostgreSQL connection
psql -U user -d database -h host -c "SELECT version();"
```

### Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Or using Yarn
yarn global add pm2

# Or using pnpm
pnpm add -g pm2

# Verify installation
pm2 --version
```

---

## Installation

### 1. Clone or Prepare Application

```bash
# Clone repository (if deploying from git)
git clone https://github.com/your-username/agenrouter-scheduller.git
cd agenrouter-scheduller

# Or ensure you're in the project directory
cd /path/to/agenrouter-scheduller
```

### 2. Install Dependencies

```bash
# Install production dependencies
npm ci --only=production

# Or if you don't have package-lock.json
npm install --production
```

### 3. Configure Environment Variables

```bash
# Copy environment template
cp .env.production.example .env

# Edit with your values
nano .env
# or
vim .env
```

**Required variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to `production`
- `NEXT_PUBLIC_BASE_URL`: Your application URL

**Example `.env` file:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/agentrouter"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
PORT=3000
SHOW_BROWSER="false"
DEBUG_BROWSER="false"
```

### 4. Run Database Migrations

```bash
# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 5. Build Application

```bash
# Build for production
npm run build

# This creates:
# - .next/ directory
# - server.js (standalone server)
```

---

## Configuration

### PM2 Ecosystem Configuration

The project includes `ecosystem.config.js` with the following settings:

```javascript
module.exports = {
  apps: [{
    name: 'agentrouter-scheduler',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }],
};
```

**Configuration Explained:**
- `script`: Entry point (server.js from standalone build)
- `instances: 'max'`: Uses all CPU cores
- `exec_mode: 'cluster'`: Runs in cluster mode for load balancing
- `autorestart: true`: Automatically restart on crash
- `max_memory_restart: '1G'`: Restart if memory exceeds 1GB
- `log_*`: Log file paths and formatting

### Customizing Ecosystem Configuration

Edit `ecosystem.config.js` to customize:

```javascript
module.exports = {
  apps: [{
    name: 'agentrouter-scheduler',
    script: './server.js',
    instances: 4,  // Use 4 instances instead of max
    exec_mode: 'fork',  // Use fork mode instead of cluster
    max_memory_restart: '2G',  // 2GB memory limit
    // ... other settings
  }],
};
```

---

## Deployment

### Using Automated Deployment Script

The project includes `deploy.sh` for automated deployment:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or use npm script
npm run deploy
```

**What `deploy.sh` does:**
1. Pulls latest code from git (optional)
2. Installs production dependencies
3. Runs database migrations
4. Generates Prisma Client
5. Builds the application
6. Creates logs directory
7. Starts/reloads PM2 process
8. Saves PM2 configuration
9. Sets up PM2 startup script

### Manual Deployment

#### Step 1: Build Application

```bash
npm run build
```

#### Step 2: Create Logs Directory

```bash
mkdir -p logs
```

#### Step 3: Start PM2

```bash
# Start PM2 ecosystem
npm run pm2:start

# Or directly
pm2 start ecosystem.config.js --env production
```

#### Step 4: Save PM2 Configuration

```bash
# Save current process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u $USER --hp /home/$USER

# Follow the instructions to enable startup
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

---

## Monitoring

### View PM2 Status

```bash
# Show all processes
pm2 status

# Show detailed information
pm2 show agentrouter-scheduler

# Monitor real-time metrics
pm2 monit

# Or use npm script
npm run pm2:monit
```

### View Logs

```bash
# View all logs
npm run pm2:logs

# View error logs only
pm2 logs agentrouter-scheduler --err

# View last 100 lines
pm2 logs agentrouter-scheduler --lines 100

# View logs with timestamps
pm2 logs agentrouter-scheduler --lines 50 --nostream

# Flush logs (clear log files)
npm run pm2:flush
```

### Monitor Resource Usage

```bash
# Real-time monitoring
pm2 monit

# Or check individual process
pm2 describe agentrouter-scheduler
```

---

## PM2 Commands

### Process Management

```bash
# Start process
npm run pm2:start
# or
pm2 start ecosystem.config.js

# Stop process
npm run pm2:stop
# or
pm2 stop ecosystem.config.js

# Restart process (kills and starts)
npm run pm2:restart
# or
pm2 restart ecosystem.config.js

# Reload process (graceful reload, zero downtime)
npm run pm2:reload
# or
pm2 reload ecosystem.config.js

# Delete process
npm run pm2:delete
# or
pm2 delete ecosystem.config.js
```

### Log Management

```bash
# View logs
npm run pm2:logs

# Flush logs
npm run pm2:flush

# View log files directly
cat logs/combined.log
cat logs/out.log
cat logs/error.log
```

### System Management

```bash
# Save current process list
pm2 save

# Dump current process list to file
pm2 dump

# Resurrect processes from dump file
pm2 resurrect

# List startup script
pm2 startup list

# Delete startup script
pm2 startup uninstall
```

---

## Troubleshooting

### Issue: Application Won't Start

**Symptoms:** PM2 status shows `errored` or `stopped`

**Solutions:**

```bash
# Check error logs
cat logs/error.log

# Check out logs
cat logs/out.log

# Check PM2 logs
pm2 logs agentrouter-scheduler --err

# Common causes:
# 1. Port 3000 already in use
# 2. Database connection failed
# 3. Missing environment variables
# 4. Build failed

# Restart with verbose logging
pm2 restart ecosystem.config.js --env production
```

### Issue: High Memory Usage

**Symptoms:** Process keeps restarting due to memory limit

**Solutions:**

```bash
# Increase memory limit in ecosystem.config.js
# Edit: max_memory_restart: '2G'

# Or disable memory limit
# Comment out: max_memory_restart

# Check actual memory usage
pm2 monit
```

### Issue: Database Connection Failed

**Symptoms:** Logs show database connection errors

**Solutions:**

```bash
# Test database connection
psql -U user -d database -h host -c "SELECT version();"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Ensure database is accessible
# - Check firewall rules
# - Verify user permissions
# - Test SSL connection
```

### Issue: Puppeteer/Browser Automation Fails

**Symptoms:** Browser automation crashes or times out

**Solutions:**

```bash
# Run with browser visible for debugging
SHOW_BROWSER="true" DEBUG_BROWSER="true" pm2 restart agentrouter-scheduler

# Check system resources
df -h  # Disk space
free -h  # Memory

# Install Chromium dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils
```

### Issue: PM2 Won't Start on Boot

**Symptoms:** PM2 doesn't start automatically after server reboot

**Solutions:**

```bash
# Check if startup script is installed
pm2 startup list

# Install startup script (if not installed)
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# Copy and paste the command output by pm2 startup

# Enable the service
sudo systemctl enable pm2-$USER
sudo systemctl start pm2-$USER

# Check service status
systemctl status pm2-$USER
```

### Issue: Logs Too Large

**Symptoms:** Log files are growing rapidly

**Solutions:**

```bash
# Flush logs
npm run pm2:flush

# Set up log rotation in ecosystem.config.js
log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
merge_logs: true,

# Or manually rotate logs
mv logs/combined.log logs/combined-$(date +%Y%m%d).log
pm2 flush
```

---

## Advanced Configuration

### Cluster Mode vs Fork Mode

**Cluster Mode:**
- Uses all CPU cores
- Better for CPU-intensive tasks
- Zero-downtime reloads
- More memory usage

**Fork Mode:**
- Single process or specified number
- Better for I/O-intensive tasks
- Less memory usage
- Simpler debugging

```javascript
// Cluster mode (default)
exec_mode: 'cluster',
instances: 'max',

// Fork mode
exec_mode: 'fork',
instances: 4,
```

### Load Balancing with Nginx

Configure Nginx as reverse proxy:

```nginx
upstream agentrouter {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://agentrouter;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://agentrouter;
        # ... other proxy settings
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Zero-Downtime Deployment

Use `pm2 reload` instead of `pm2 restart`:

```bash
# Zero-downtime reload (cluster mode only)
npm run pm2:reload

# Or manually
pm2 reload agentrouter-scheduler --env production
```

---

## Performance Optimization

### Instance Configuration

```javascript
// For CPU-intensive tasks
instances: 'max',
exec_mode: 'cluster',

// For I/O-intensive tasks
instances: 2,
exec_mode: 'fork',

// For memory constraints
instances: 1,
exec_mode: 'fork',
max_memory_restart: '512M',
```

### Monitoring with PM2 Plus

PM2 Plus provides:
- Real-time monitoring
- Custom dashboards
- Alert notifications
- Remote management

```bash
# Link to PM2 Plus
pm2 link <secret_key> <public_key>
```

---

## Backup and Recovery

### Backup PM2 Configuration

```bash
# Dump current configuration
pm2 dump

# Save dump file
cp dump.pm2 backup/dump.pm2
```

### Restore PM2 Configuration

```bash
# Restore from dump
pm2 resurrect

# Or load specific dump
pm2 resurrect dump.pm2
```

---

## Security Best Practices

1. **Never commit `.env` file** with real values
2. **Use strong passwords** for database
3. **Enable SSL/TLS** for production
4. **Configure firewall** to allow only necessary ports
5. **Regular updates** of dependencies and system packages
6. **Monitor logs** for suspicious activity
7. **Limit PM2 access** to authorized users only
8. **Use systemd** for PM2 startup (secure and reliable)

---

## Maintenance

### Regular Updates

```bash
# Pull latest code
git pull origin release/beta-1.0.0

# Update dependencies
npm ci --only=production

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Reload PM2 (zero downtime)
npm run pm2:reload
```

### Database Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/agentrouter_$DATE.sql.gz"

# Create backup
pg_dump -U agenrouter agentrouter | gzip > $BACKUP_FILE

# Keep last 7 days
find $BACKUP_DIR -name "agentrouter_*.sql.gz" -mtime +7 -delete

# Add to crontab for daily backups
# 0 2 * * * /path/to/backup-script.sh
```

---

## Getting Help

### PM2 Documentation

- [PM2 Official Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)

### Project Documentation

- [Deployment Guide](./deployment.md)
- [Setup Guide](./setup.md)
- [Architecture Guide](./architecture.md)

### Troubleshooting Commands

```bash
# Check system logs
journalctl -u pm2-$USER -n 100

# Check PM2 logs
pm2 logs agentrouter-scheduler --lines 100 --nostream

# Check application logs
cat logs/error.log
cat logs/out.log
```

---

## Quick Reference

### Common PM2 Commands

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start PM2 ecosystem |
| `npm run pm2:stop` | Stop PM2 ecosystem |
| `npm run pm2:restart` | Restart PM2 ecosystem |
| `npm run pm2:reload` | Zero-downtime reload |
| `npm run pm2:logs` | View logs |
| `npm run pm2:monit` | Monitor processes |
| `npm run deploy` | Run deployment script |

### NPM Scripts Added

```json
{
  "scripts": {
    "pm2:start": "pm2 start ecosystem.config.js --env production",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:reload": "pm2 reload ecosystem.config.js",
    "pm2:logs": "pm2 logs agentrouter-scheduler",
    "pm2:monit": "pm2 monit",
    "pm2:delete": "pm2 delete ecosystem.config.js",
    "pm2:flush": "pm2 flush",
    "deploy": "bash deploy.sh"
  }
}
```

---

## Success Checklist

Before going live, verify:

- [ ] Environment variables are set correctly in `.env`
- [ ] Database connection is working
- [ ] Migrations have been applied
- [ ] Application builds successfully
- [ ] PM2 starts without errors
- [ ] PM2 is configured to start on boot
- [ ] Logs are being written correctly
- [ ] Application is accessible on the expected port
- [ ] Scheduler is running (if enabled)
- [ ] SSL/TLS is configured (for production)
- [ ] Firewall rules are configured
- [ ] Backup strategy is in place

---

Congratulations! Your application is now deployed with PM2! 🚀
