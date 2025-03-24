#!/usr/bin/env node

/**
 * dev.js
 * 
 * Script to:
 * 1. Kill all running servers
 * 2. Start a new development server
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const { killRunningServers } = require('./utils/kill-servers');

async function runDev() {
  try {
    // Step 1: Kill all running servers
    console.log('🔄 Cleaning up existing servers...');
    killRunningServers();
    
    // Give the OS time to fully release the ports
    console.log('⏳ Waiting for ports to be released...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Start Next.js development server
    console.log('🚀 Starting development server...');
    
    const nextDev = spawn('next', ['dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..')
    });
    
    // Handle process events
    nextDev.on('error', (error) => {
      console.error('❌ Failed to start development server:', error.message);
      process.exit(1);
    });
    
    nextDev.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Development server exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle termination signals to clean up the child process
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    signals.forEach(signal => {
      process.on(signal, () => {
        if (!nextDev.killed) {
          nextDev.kill(signal);
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error running development script:', error.message);
    process.exit(1);
  }
}

runDev();
