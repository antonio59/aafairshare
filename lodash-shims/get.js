// Import get directly as a named import
import { get } from 'lodash';

// Export it as default for compatibility with libraries expecting default export
export default get;

// Also export as named export for ESM compatibility
export { get };
