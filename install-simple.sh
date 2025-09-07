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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed, if not install it
if ! command -v node &> /dev/null; then
    print_status "Node.js not found. Installing Node.js..."
    
    # Detect package manager and install Node.js accordingly
    if command -v yum &> /dev/null; then
        # Amazon Linux/CentOS/RHEL
        print_status "Detected yum package manager (Amazon Linux/CentOS)"
        print_status "Updating system packages..."
        sudo yum update -y
        
        print_status "Installing Node.js using yum..."
        sudo yum install -y nodejs npm
        
    elif command -v apt &> /dev/null; then
        # Ubuntu/Debian
        print_status "Detected apt package manager (Ubuntu/Debian)"
        print_status "Updating system packages..."
        sudo apt update
        
        print_status "Installing Node.js from NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
    elif command -v dnf &> /dev/null; then
        # Fedora
        print_status "Detected dnf package manager (Fedora)"
        print_status "Installing Node.js using dnf..."
        sudo dnf install -y nodejs npm
        
    else
        print_error "Unsupported package manager. Please install Node.js manually."
        exit 1
    fi
    
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

# Install dependencies based on package manager
if command -v yum &> /dev/null; then
    # Amazon Linux/CentOS/RHEL dependencies
    print_status "Installing Playwright dependencies for Amazon Linux..."
    
    # Try to install available packages
    sudo yum install -y \
        atk \
        at-spi2-atk \
        libX11 \
        libXcomposite \
        libXdamage \
        libXext \
        libXfixes \
        libXrandr \
        mesa-libgbm \
        libxcb \
        libxkbcommon \
        alsa-lib \
        libdrm \
        libXScrnSaver \
        alsa-lib \
        gtk3 \
        gdk-pixbuf2 || true
    
    # Use Playwright's own dependency installer as fallback
    print_status "Running Playwright's dependency installer as fallback..."
    sudo npx playwright install-deps || true
    
elif command -v apt &> /dev/null; then
    # Ubuntu/Debian dependencies
    print_status "Installing Playwright dependencies for Ubuntu/Debian..."
    npx playwright install-deps
elif command -v dnf &> /dev/null; then
    # Fedora dependencies
    print_status "Installing Playwright dependencies for Fedora..."
    npx playwright install-deps
else
    print_error "Cannot install Playwright dependencies. Please install manually."
fi

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
echo "⚠️  If you still get dependency errors, run:"
echo "   sudo npx playwright install-deps"
echo ""
echo "Ready to create Instagram accounts! 🚀"
