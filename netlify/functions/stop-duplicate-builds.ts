import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Interface representing the Netlify build payload structure
 * Contains information about the build trigger source and properties
 */
interface BuildPayload {
  source?: string;
  manual_deploy?: boolean;
  triggered_by?: string;
  branch?: string;
  title?: string;
}

/**
 * Interface for the complete event payload structure
 * Wraps the BuildPayload in a payload property
 */
interface EventPayload {
  payload: BuildPayload;
}

/**
 * Netlify Function: Stop Duplicate Builds
 * 
 * This function runs as a webhook handler for Netlify build events.
 * It analyzes incoming build triggers and prevents duplicate builds by
 * canceling generic HEAD builds when specific commit builds are also triggered.
 * 
 * The function allows the following types of builds to proceed:
 * - Manual deployments
 * - CLI-triggered builds
 * - Branch-specific builds (not main/master)
 * 
 * It cancels:
 * - Generic HEAD builds that would be redundant with commit-specific builds
 * 
 * @param event - The incoming webhook event
 * @returns Response object with statusCode and message
 */
const handler: Handler = async (event: HandlerEvent) => {
  // We need to parse the payload to access the build data
  const payload = JSON.parse(event.body || '{}') as EventPayload;
  
  // We only want to apply this to automatic deploys from Git
  if (payload.payload?.source === 'github' || payload.payload?.source === 'gitlab' || payload.payload?.source === 'bitbucket') {
    console.log('Build triggered from Git, checking if we should cancel...');
    
    // Check if a manual deploy was just triggered
    if (payload.payload.manual_deploy) {
      console.log('This is a manual deploy, allowing it to proceed');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Manual deploy - allowing build to proceed" })
      };
    }
    
    // If a build was triggered via the Netlify CLI, allow it to proceed
    if (payload.payload.triggered_by === 'cli') {
      console.log('Build triggered via CLI, allowing it to proceed');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "CLI deploy - allowing build to proceed" })
      };
    }

    // If a branch deploy was triggered for a specific branch, allow it
    if (payload.payload.branch && payload.payload.branch !== 'main' && payload.payload.branch !== 'master') {
      console.log(`Build triggered for branch ${payload.payload.branch}, allowing it to proceed`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Branch deploy for ${payload.payload.branch} - allowing build to proceed` })
      };
    }
    
    // If this is a generic HEAD build and we have something more specific, cancel it
    if (payload.payload.title && payload.payload.title.includes('@HEAD')) {
      console.log('Canceling generic HEAD build, as a specific commit build will be triggered');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Canceling generic HEAD build to avoid duplication",
          cancel: true
        })
      };
    }
  }
  
  // Allow the build to proceed
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Build allowed to proceed" })
  };
};

export { handler }; 