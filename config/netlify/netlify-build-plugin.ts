/**
 * Netlify Build Plugin to prevent duplicate builds
 * 
 * This plugin helps prevent redundant builds in Netlify by monitoring
 * build triggers and logging information about potentially duplicate builds.
 * 
 * When Netlify receives a GitHub push event, it often triggers two builds:
 * 1. One for the generic HEAD reference (main@HEAD)
 * 2. Another for the specific commit hash (main@abc123)
 * 
 * This plugin logs warnings about these situations to help identify and
 * address duplicate builds through Netlify's build hooks.
 */

/**
 * Interface for the Netlify Build Utils object
 * Contains methods for failing or canceling builds and showing status messages
 */
interface BuildUtils {
  build: {
    failBuild: (message: string) => void;
    cancelBuild: (message: string) => void;
  };
  status: {
    show: (message: string) => void;
  };
}

/**
 * Interface for the Netlify Build Constants object
 * Contains information about the current build environment
 */
interface BuildConstants {
  BRANCH: string;
  CONTEXT: string;
  IS_LOCAL: boolean;
}

/**
 * Interface for the parameters passed to build plugin hooks
 */
interface BuildParams {
  utils: BuildUtils;
  constants: BuildConstants;
}

// Export the plugin object
export default {
  /**
   * onPreBuild event handler
   * Runs before the build starts and logs information about the build environment
   * 
   * @param utils - Netlify build utilities for manipulating builds
   * @param constants - Constants containing information about the build environment
   */
  onPreBuild: ({ utils, constants }: BuildParams) => {
    const { BRANCH, COMMIT_REF, CONTEXT } = process.env;
    
    console.log('Current build environment:', { 
      branch: BRANCH, 
      commit: COMMIT_REF,
      context: CONTEXT,
      buildId: process.env.BUILD_ID
    });
    
    // If this is a deployment preview or branch deploy, always allow it
    if (CONTEXT === 'deploy-preview' || (CONTEXT === 'branch-deploy' && BRANCH !== 'main' && BRANCH !== 'master')) {
      console.log('This is a preview deploy or branch deploy, allowing it to proceed');
      return;
    }
    
    // If title has @HEAD and we're in production, we might want to cancel
    // However, we can't easily do this in a build plugin since we don't know
    // about other pending builds. Instead, we'll log it.
    if (process.env.COMMIT_REF_NAME && process.env.COMMIT_REF_NAME.includes('@HEAD')) {
      console.log('⚠️ Warning: This appears to be a generic HEAD build.');
      console.log('You may want to set up build hooks to handle this case.');
    }
    
    // Log the build environment to help with debugging
    console.log('Build environment detail:', { 
      allEnv: Object.keys(process.env)
        .filter(key => key.startsWith('NETLIFY') || key.startsWith('BUILD') || key.startsWith('COMMIT'))
        .reduce<Record<string, string | undefined>>((obj, key) => {
          obj[key] = process.env[key];
          return obj;
        }, {})
    });
  }
}; 