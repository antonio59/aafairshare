#!/usr/bin/env node

/**
 * kill-servers.js
 * 
 * Script to find and kill all running Next.js and Node.js processes
 * to prevent port conflicts when starting a new development server.
 */

const { execSync } = require('child_process');

function killRunningServers() {
  console.log('🔍 Finding running Node.js and Next.js processes...');
  
  try {
    // Different command for different platforms
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // For Windows
      try {
        const result = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV').toString();
        const lines = result.split('\n').filter(line => line.includes('node.exe'));
        
        if (lines.length > 0) {
          console.log(`Found ${lines.length} Node.js processes. Attempting to terminate...`);
          
          for (const line of lines) {
            try {
              // Extract PID from CSV format
              const pid = line.split('","')[1].replace('"', '');
              if (pid) {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`✅ Terminated process with PID: ${pid}`);
              }
            } catch (err) {
              console.log(`Failed to kill process: ${err.message}`);
            }
          }
        } else {
          console.log('No Node.js processes found.');
        }
      } catch (err) {
        console.error('Error finding Node.js processes:', err.message);
      }
    } else {
      // For macOS/Linux
      try {
        // Find processes related to Next.js (node processes with "next" in command)
        const psOutput = execSync('ps aux | grep "[n]ode.*next\\|[n]ext"').toString();
        const lines = psOutput.split('\n').filter(Boolean);
        
        if (lines.length > 0) {
          console.log(`Found ${lines.length} Next.js/Node.js processes. Attempting to terminate...`);
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            // PID is typically the second column in the output
            if (parts.length >= 2) {
              const pid = parts[1];
              try {
                execSync(`kill -9 ${pid}`);
                console.log(`✅ Terminated process with PID: ${pid}`);
              } catch (killErr) {
                console.log(`Failed to kill process ${pid}: ${killErr.message}`);
              }
            }
          }
        } else {
          console.log('No Next.js/Node.js processes found.');
        }
      } catch (err) {
        // If grep doesn't find any process, it returns non-zero exit code
        if (!err.message.includes('exit 1')) {
          console.error('Error finding Next.js processes:', err.message);
        } else {
          console.log('No Next.js/Node.js processes found.');
        }
      }
      
      // Also check for any process listening on typical Next.js ports
      try {
        const ports = [3000, 3001, 3002, 3003, 3004, 3005];
        for (const port of ports) {
          try {
            const lsofOutput = execSync(`lsof -i :${port} -t`).toString().trim();
            if (lsofOutput) {
              const pids = lsofOutput.split('\n').filter(Boolean);
              for (const pid of pids) {
                try {
                  execSync(`kill -9 ${pid}`);
                  console.log(`✅ Terminated process on port ${port} with PID: ${pid}`);
                } catch (killErr) {
                  console.log(`Failed to kill process ${pid} on port ${port}: ${killErr.message}`);
                }
              }
            }
          } catch (portErr) {
            // If lsof doesn't find any process, it returns non-zero exit code
            // This is expected, so we ignore it
          }
        }
      } catch (err) {
        console.error('Error finding processes on ports:', err.message);
      }
    }
    
    console.log('✅ Process cleanup complete.');
    
  } catch (error) {
    console.error('❌ Failed to kill servers:', error.message);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  killRunningServers();
}

module.exports = { killRunningServers };
