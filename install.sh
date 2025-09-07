#!/bin/bash

# Instagram Account Creation Bot - Ubuntu Installation Script
# This script installs all dependencies and sets up the environment

set -e  # Exit on any error

echo "🚀 Instagram Account Creation Bot - Ubuntu Installation"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js (using NodeSource repository for latest LTS)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js installed: $NODE_VERSION"
print_success "npm installed: $NPM_VERSION"

# Install Playwright dependencies
print_status "Installing Playwright system dependencies..."
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

# Install additional dependencies for headless browser
print_status "Installing additional browser dependencies..."
sudo apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils

# Create project directory if it doesn't exist
PROJECT_DIR="$HOME/ig-creator"
if [ ! -d "$PROJECT_DIR" ]; then
    print_status "Creating project directory: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

# Copy project files to the project directory
print_status "Setting up project files..."
cp -r . "$PROJECT_DIR/"
cd "$PROJECT_DIR"

# Install npm dependencies
print_status "Installing npm dependencies..."
npm install

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install chromium
npx playwright install-deps chromium

# Create accounts.json if it doesn't exist
if [ ! -f "accounts.json" ]; then
    print_status "Creating accounts.json file..."
    echo "[]" > accounts.json
fi

# Set proper permissions
print_status "Setting file permissions..."
chmod +x *.sh
chmod 644 accounts.json

# Create a systemd service file for running as a service (optional)
print_status "Creating systemd service file..."
sudo tee /etc/systemd/system/ig-creator.service > /dev/null <<EOF
[Unit]
Description=Instagram Account Creation Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Create a simple run script
print_status "Creating run script..."
cat > run.sh << 'EOF'
#!/bin/bash

# Instagram Account Creation Bot Runner
echo "🚀 Starting Instagram Account Creation Bot..."
echo "📁 Working directory: $(pwd)"
echo "📊 Target: 1000 accounts"
echo "⏰ Started at: $(date)"
echo "=========================================="

# Run the bot
node index.js

echo "=========================================="
echo "⏰ Finished at: $(date)"
EOF

chmod +x run.sh

# Create a stop script
print_status "Creating stop script..."
cat > stop.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Instagram Account Creation Bot..."

# Kill any running node processes for this bot
pkill -f "node index.js"

echo "✅ Bot stopped"
EOF

chmod +x stop.sh

# Create a status script
print_status "Creating status script..."
cat > status.sh << 'EOF'
#!/bin/bash

echo "📊 Instagram Account Creation Bot Status"
echo "======================================"

# Check if bot is running
if pgrep -f "node index.js" > /dev/null; then
    echo "🟢 Status: RUNNING"
    echo "📈 Process ID: $(pgrep -f 'node index.js')"
else
    echo "🔴 Status: STOPPED"
fi

# Show accounts count
if [ -f "accounts.json" ]; then
    ACCOUNT_COUNT=$(jq length accounts.json 2>/dev/null || echo "0")
    echo "📊 Total accounts created: $ACCOUNT_COUNT"
else
    echo "📊 Total accounts created: 0"
fi

echo "📁 Working directory: $(pwd)"
echo "⏰ Current time: $(date)"
EOF

chmod +x status.sh

# Install jq for JSON processing (used in status script)
print_status "Installing jq for JSON processing..."
sudo apt install -y jq

# Create logs directory
mkdir -p logs

# Final setup
print_status "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Installation complete
echo ""
echo "🎉 Installation Complete!"
echo "========================="
print_success "Instagram Account Creation Bot has been installed successfully!"
echo ""
echo "📁 Project location: $PROJECT_DIR"
echo "🚀 To start the bot: cd $PROJECT_DIR && ./run.sh"
echo "🛑 To stop the bot: ./stop.sh"
echo "📊 To check status: ./status.sh"
echo "⚙️  To run as service: sudo systemctl start ig-creator"
echo ""
echo "📋 Available commands:"
echo "  ./run.sh     - Start the bot manually"
echo "  ./stop.sh    - Stop the bot"
echo "  ./status.sh  - Check bot status and account count"
echo ""
echo "📝 Configuration:"
echo "  - Target accounts: 1000 (edit index.js to change)"
echo "  - Accounts saved to: accounts.json"
echo "  - Logs directory: logs/"
echo ""
print_warning "Make sure to run the bot from the project directory: $PROJECT_DIR"
echo ""
print_success "Ready to create Instagram accounts! 🚀"
