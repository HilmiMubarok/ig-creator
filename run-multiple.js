const { spawn } = require('child_process');
const path = require('path');

// Function to run a single instance
function runInstance(instanceNumber) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting instance ${instanceNumber}...`);
    
    const child = spawn('node', ['index.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const message = `[Instance ${instanceNumber}] ${data.toString()}`;
      console.log(message);
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      const message = `[Instance ${instanceNumber} ERROR] ${data.toString()}`;
      console.error(message);
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Instance ${instanceNumber} completed successfully`);
        resolve({ instanceNumber, success: true, output, errorOutput });
      } else {
        console.log(`❌ Instance ${instanceNumber} failed with code ${code}`);
        resolve({ instanceNumber, success: false, output, errorOutput, exitCode: code });
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Instance ${instanceNumber} error:`, error.message);
      reject({ instanceNumber, error: error.message });
    });
  });
}

// Main function to run multiple instances
async function runMultipleInstances(totalInstances = 20) {
  console.log(`🎯 Starting ${totalInstances} instances of Instagram account creation bot`);
  console.log('📝 Each instance will create 10 accounts');
  console.log('📊 Total accounts to be created:', totalInstances * 10);
  console.log('='.repeat(60));

  const startTime = Date.now();
  const results = [];
  const concurrency = 5; // Run 5 instances at a time to avoid overwhelming the system

  // Process instances in batches
  for (let i = 0; i < totalInstances; i += concurrency) {
    const batch = [];
    const batchSize = Math.min(concurrency, totalInstances - i);
    
    console.log(`\n🔄 Starting batch ${Math.floor(i / concurrency) + 1} (instances ${i + 1}-${i + batchSize})`);
    
    // Start batch of instances
    for (let j = 0; j < batchSize; j++) {
      const instanceNumber = i + j + 1;
      batch.push(runInstance(instanceNumber));
    }

    // Wait for current batch to complete
    try {
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
      
      console.log(`✅ Batch ${Math.floor(i / concurrency) + 1} completed`);
      
      // Add delay between batches to avoid overwhelming the system
      if (i + concurrency < totalInstances) {
        console.log('⏳ Waiting 30 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      console.error('❌ Batch error:', error);
    }
  }

  // Summary
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
  
  console.log(`⏱️  Total runtime: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`✅ Successful instances: ${successful}/${totalInstances}`);
  console.log(`❌ Failed instances: ${failed}/${totalInstances}`);
  console.log(`📈 Success rate: ${Math.round((successful / totalInstances) * 100)}%`);
  console.log(`📊 Total accounts created: ${successful * 10} (estimated)`);
  
  if (failed > 0) {
    console.log('\n❌ Failed instances:');
    results.forEach((result, index) => {
      if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
        const instanceNumber = result.status === 'fulfilled' ? result.value.instanceNumber : index + 1;
        console.log(`  - Instance ${instanceNumber}`);
      }
    });
  }
  
  console.log('\n🎉 All instances completed!');
}

// Run the script
if (require.main === module) {
  const totalInstances = process.argv[2] ? parseInt(process.argv[2]) : 20;
  runMultipleInstances(totalInstances).catch(console.error);
}

module.exports = { runMultipleInstances, runInstance };
