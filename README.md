# Agent Router Scheduler

An automated credit collection system for Agent Router that manages multiple accounts, automates login/logout schedules, and tracks redemption logs.

## Overview

Agent Router Scheduler is a web application built with Next.js 16 that automates the process of logging into Agent Router accounts to collect daily credits. The system manages session cookies, schedules automated login/logout tasks, and maintains comprehensive logs of all automated activities.

## Features

- **Cookie Management**: Store and manage session cookies for multiple Agent Router accounts
- **Task Scheduling**: Create and manage automated login/logout schedules with flexible timing
- **Log History**: Track all automated tasks with detailed execution logs and status
- **Account Dashboard**: View current balance, consumption, and redemption history for each account
- **OAuth Flow**: Automated GitHub OAuth integration using Puppeteer for seamless authentication

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **UI/Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack Query (React Query) v5 + Zustand
- **Task Scheduling**: node-cron for server-side job scheduling
- **Browser Automation**: Puppeteer for OAuth automation
- **Form Handling**: Base UI components

## Quick Start

### Local Development

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd agenrouter-scheduller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

### PM2 Deployment (Recommended for VPS/Dedicated Servers)

**Quick Start:**

```bash
# Install PM2 globally
npm install -g pm2

# Deploy using automated script
chmod +x deploy.sh
./deploy.sh

# Or use npm script
npm run deploy
```

**Manual Steps:**

1. Set up environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Build application: `npm run build`
4. Start PM2: `npm run pm2:start`

**Full Guide:** See [PM2 Deployment Guide](./docs/pm2-deployment.md) for detailed instructions, monitoring, and troubleshooting.

### Other Deployment Options

- **Vercel**: See [Deployment Guide](./docs/deployment.md#1-vercel-recommended)
- **Docker**: See [Deployment Guide](./docs/deployment.md#2-docker-deployment)
- **Self-Hosted**: See [Deployment Guide](./docs/deployment.md#3-self-hosted-vpsdedicated-server)
- **Kubernetes**: See [Deployment Guide](./docs/deployment.md#4-kubernetes-deployment-advanced)

## Documentation

- [Architecture Guide](./docs/architecture.md) - System architecture and design decisions
- [Setup Guide](./docs/setup.md) - Detailed installation and configuration
- [Database Schema](./docs/database.md) - Database models and relationships
- [API Reference](./docs/api.md) - API endpoints and usage
- [Development Guide](./docs/development.md) - Contributing and development workflow
- **[PM2 Deployment Guide](./docs/pm2-deployment.md)** - Production deployment using PM2
- [Deployment Guide](./docs/deployment.md) - General deployment instructions (Vercel, Docker, Kubernetes)
- [Product Requirements](./docs/prd.md) - Original product requirements

## Core Pages

- **Dashboard** (`/`) - Overview of all accounts and recent activity
- **Cookie Management** (`/cookies`) - Add, edit, and validate session cookies
- **Scheduler** (`/scheduler`) - Create and manage automated login/logout tasks
- **Logs** (`/logs`) - View execution history with detailed logs
- **Redemption Logs** (`/redemption-logs`) - Track credit redemption for each account

## How It Works

1. **Cookie Storage**: Users store their Agent Router and GitHub session cookies in the database
2. **Scheduling**: Create schedules with specific times for automated login/logout
3. **Automation**: The scheduler (node-cron) executes tasks at scheduled times using Puppeteer for browser automation
4. **Logging**: All actions are logged with detailed information for troubleshooting and audit trails
5. **Tracking**: Account balances and redemption logs are automatically updated

## PM2 Commands

```bash
# Start application
npm run pm2:start

# Stop application
npm run pm2:stop

# Restart application
npm run pm2:restart

# Reload (zero downtime)
npm run pm2:reload

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Deploy
npm run deploy
```

## Environment Variables

### Required Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Optional Variables

```env
PORT=3000
SHOW_BROWSER="false"
DEBUG_BROWSER="false"
LOG_LEVEL="info"
```

See [`.env.production.example`](./.env.production.example) for complete configuration options.

## Security Considerations

- Session cookies are stored in the database and should be treated as sensitive data
- Use environment variables for all configuration secrets
- Consider implementing additional encryption for stored cookies in production
- The application does not handle passwords directly - it uses session-based authentication

## Troubleshooting

### PM2 Issues

- Application won't start: Check logs with `npm run pm2:logs`
- High memory usage: Adjust `max_memory_restart` in `ecosystem.config.js`
- Database connection errors: Verify `DATABASE_URL` in `.env`

### Common Issues

- **Puppeteer fails**: Install Chromium dependencies or set `SHOW_BROWSER=true` for debugging
- **Scheduler not executing**: Check server logs for initialization messages
- **Database connection errors**: Test connection with `psql` or Prisma Studio

For detailed troubleshooting, see:
- [PM2 Deployment Guide](./docs/pm2-deployment.md#troubleshooting)
- [Setup Guide](./docs/setup.md#troubleshooting)

## Contributing

Contributions are welcome! Please read the [Development Guide](./docs/development.md) for details on how to contribute.

## License

[Specify your license here]

## Support

For issues and questions, please open an issue in the repository.

---

**Recommended Deployment:** PM2 with systemd for production servers.
**Quick Start:** `npm run deploy`
**Monitor:** `npm run pm2:monit`
