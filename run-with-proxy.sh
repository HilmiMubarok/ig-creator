#!/bin/bash

# Script to run Instagram account creation bot with proxychains4
# Usage: ./run-with-proxy.sh [number_of_instances]

INSTANCES=${1:-1}
echo "🚀 Starting $INSTANCES instances with proxychains4"
echo "📊 Total accounts to be created: $((INSTANCES * 10))"
echo "🌐 Using proxychains4 for proxy support"
echo "=" | head -c 60; echo

# Check if proxychains4 is installed
if ! command -v proxychains4 &> /dev/null; then
    echo "❌ proxychains4 is not installed!"
    echo "📝 Install with: sudo apt-get install proxychains4"
    echo "📝 Or: brew install proxychains-ng"
    exit 1
fi

# Check if proxychains4 config exists
if [ ! -f /etc/proxychains4.conf ]; then
    echo "❌ proxychains4 config not found at /etc/proxychains4.conf"
    echo "📝 Please configure proxychains4 first"
    exit 1
fi

# Function to run a single instance with proxychains4
run_instance() {
    local instance_num=$1
    echo "🚀 Starting instance $instance_num with proxychains4..."
    
    # Run with proxychains4
    proxychains4 -q node index.js > "output_$instance_num.log" 2>&1 &
    local pid=$!
    echo "Instance $instance_num started with PID: $pid"
    echo $pid > "pid_$instance_num.txt"
}

# Start all instances
for i in $(seq 1 $INSTANCES); do
    run_instance $i
    sleep 5  # Delay between starting instances
done

echo "✅ All $INSTANCES instances started with proxychains4!"
echo "📝 Check individual logs: output_1.log, output_2.log, etc."
echo "📝 Check PIDs: pid_1.txt, pid_2.txt, etc."

# Wait for all instances to complete
echo "⏳ Waiting for all instances to complete..."
wait

echo "🎉 All instances completed!"
echo "📊 Check the accounts.json file for all created accounts"
