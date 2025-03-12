/* eslint-env node */
// This file is used to check that Netlify is using the correct Node.js version
exports.handler = async function(_event, _context) {
  try {
    // Log the Node.js version being used
    console.log(`Node.js version in function: ${process.version}`);
    
    // Check if Node.js version is >= 20
    const majorVersion = parseInt(process.version.slice(1).split('.')[0], 10);
    
    if (majorVersion < 20) {
      throw new Error(`Node.js version ${process.version} is not compatible. This project requires Node.js 20 or higher.`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        nodeVersion: process.version,
        isCompatible: true,
        message: "Node.js version is compatible"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        nodeVersion: process.version,
        isCompatible: false
      })
    };
  }
};