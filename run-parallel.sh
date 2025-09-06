#!/bin/bash

# Script to run multiple instances of Instagram account creation bot
# Usage: ./run-parallel.sh [number_of_instances]

INSTANCES=${1:-20}
echo "🚀 Starting $INSTANCES instances of Instagram account creation bot"
echo "📊 Total accounts to be created: $((INSTANCES * 10))"
echo "=" | head -c 60; echo

# Function to run a single instance
run_instance() {
    local instance_num=$1
    echo "🚀 Starting instance $instance_num..."
    node index.js > "output_$instance_num.log" 2>&1 &
    local pid=$!
    echo "Instance $instance_num started with PID: $pid"
    echo $pid > "pid_$instance_num.txt"
}

# Start all instances
for i in $(seq 1 $INSTANCES); do
    run_instance $i
    sleep 2  # Small delay between starting instances
done

echo "✅ All $INSTANCES instances started!"
echo "📝 Check individual logs: output_1.log, output_2.log, etc."
echo "📝 Check PIDs: pid_1.txt, pid_2.txt, etc."

# Wait for all instances to complete
echo "⏳ Waiting for all instances to complete..."
wait

echo "🎉 All instances completed!"
echo "📊 Check the accounts.json file for all created accounts"
