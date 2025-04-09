// lodash-plugin.js
export default function lodashPlugin() {
  return {
    name: 'vite-plugin-lodash',
    resolveId(source) {
      // Only handle lodash submodule imports
      if (source.startsWith('lodash/')) {
        return {
          id: source,
          moduleSideEffects: false
        };
      }
      return null;
    },
    load(id) {
      // Only handle lodash submodule imports
      if (id.startsWith('lodash/')) {
        const method = id.replace('lodash/', '');
        return `
          import * as lodashAll from 'lodash';
          // Get the specific method
          const ${method} = lodashAll.${method};
          // Export as both default and named export for maximum compatibility
          export default ${method};
          export { ${method} };
        `;
      }
      return null;
    }
  };
}
