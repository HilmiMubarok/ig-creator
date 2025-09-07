#!/bin/bash

# Simple Instagram Bot Installation - Node.js already exists
echo "🚀 Simple Instagram Bot Installation"
echo "=================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Node.js is installed, if not install it
if ! command -v node &> /dev/null; then
    print_status "Node.js not found. Installing Node.js..."
    
    # Update system packages
    print_status "Updating system packages..."
    sudo apt update
    
    # Install Node.js using NodeSource repository
    print_status "Installing Node.js from NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
else
    print_success "Node.js already installed"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install npm dependencies
print_status "Installing npm dependencies..."
npm install

# Install Playwright system dependencies first
print_status "Installing Playwright system dependencies..."
npx playwright install-deps

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install chromium

# Create accounts.json if it doesn't exist
if [ ! -f "accounts.json" ]; then
    print_status "Creating accounts.json file..."
    echo "[]" > accounts.json
fi

# Set permissions
chmod +x *.sh

print_success "Installation complete!"
echo ""
echo "🚀 To start the bot: node index.js"
echo "📊 Target: 1000 accounts"
echo "📁 Accounts saved to: accounts.json"
echo ""
echo "Ready to create Instagram accounts! 🚀"
