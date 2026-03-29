#!/bin/bash

# Agent Router Scheduler - PM2 Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored messages
print_message() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_message "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

if ! command_exists pm2; then
    print_warning "PM2 is not installed globally. Installing..."
    npm install -g pm2
fi

if ! command_exists npx; then
    print_error "npx is not available"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.production.example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        print_message ".env file created. Please update with your values."
    else
        print_error ".env.production.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Step 1: Pull latest code (optional, for git-based deployments)
print_message "Step 1: Pulling latest code from repository..."
if command_exists git && [ -d ".git" ]; then
    git pull origin release/beta-1.0.0 || {
        print_warning "Git pull failed. Continuing with existing code..."
    }
else
    print_warning "Not a git repository or git not available. Skipping pull."
fi

# Step 2: Install dependencies
print_message "Step 2: Installing dependencies..."
npm ci --only=production || {
    print_error "Failed to install dependencies"
    exit 1
}

# Step 3: Run database migrations
print_message "Step 3: Running database migrations..."
npx prisma migrate deploy || {
    print_error "Database migration failed"
    exit 1
}

# Step 4: Generate Prisma Client
print_message "Step 4: Generating Prisma Client..."
npx prisma generate || {
    print_error "Failed to generate Prisma Client"
    exit 1
}

# Step 5: Build the application
print_message "Step 5: Building application..."
npm run build || {
    print_error "Build failed"
    exit 1
}

# Step 6: Create logs directory if it doesn't exist
print_message "Step 6: Setting up logs directory..."
mkdir -p logs

# Step 7: Start or reload PM2
print_message "Step 7: Starting/reloading PM2 process..."

if pm2 describe agentrouter-scheduler >/dev/null 2>&1; then
    print_message "Process exists, reloading..."
    pm2 reload ecosystem.config.js --env production || {
        print_warning "Reload failed, trying restart..."
        pm2 restart ecosystem.config.js --env production
    }
else
    print_message "Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production || {
        print_error "Failed to start PM2 process"
        exit 1
    }
fi

# Step 8: Save PM2 configuration
print_message "Step 8: Saving PM2 configuration..."
pm2 save || {
    print_warning "Failed to save PM2 configuration"
}

# Step 9: Setup PM2 startup script
print_message "Step 9: Setting up PM2 startup script..."
pm2 startup systemd -u $USER --hp /home/$USER || {
    print_warning "Failed to setup startup script. You may need to run this manually."
    print_warning "Run: pm2 startup systemd -u $USER --hp /home/$USER"
}

# Show status
print_message "========================================"
print_message "Deployment completed successfully!"
print_message "========================================"
print_message "PM2 Status:"
pm2 status

print_message ""
print_message "Useful commands:"
echo "  View logs:     npm run pm2:logs"
echo "  Monitor:       npm run pm2:monit"
echo "  Restart:       npm run pm2:restart"
echo "  Stop:          npm run pm2:stop"
echo "  Reload:        npm run pm2:reload"
echo "  Delete:        npm run pm2:delete"
echo "  Flush logs:    npm run pm2:flush"

print_message ""
print_message "🚀 Application is running on http://localhost:3000"
print_message ""
