// Netlify build plugin to enforce Node.js version
module.exports = {
  onPreBuild: ({ utils }) => {
    const requiredNodeVersion = '20.0.0';
    const currentNodeVersion = process.version.replace('v', '');
    
    console.log(`Current Node.js version: ${currentNodeVersion}`);
    console.log(`Required Node.js version: ${requiredNodeVersion} or higher`);
    
    // Simple version comparison (not handling all semantic versioning edge cases)
    const current = currentNodeVersion.split('.').map(Number);
    const required = requiredNodeVersion.split('.').map(Number);
    
    if (current[0] < required[0]) {
      return utils.build.failBuild(
        `Build failed: Node.js version ${currentNodeVersion} is not compatible. This project requires Node.js ${requiredNodeVersion} or higher.`
      );
    }
    
    console.log('✅ Node.js version check passed');
  }
}; 