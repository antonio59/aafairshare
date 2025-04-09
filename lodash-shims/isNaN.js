// Import isNaN directly as a named import
import { isNaN } from 'lodash';

// Export it as default for compatibility with libraries expecting default export
export default isNaN;

// Also export as named export for ESM compatibility
export { isNaN };
