/**
 * This file re-exports lodash functions to ensure they're properly available
 * as both named and default exports for compatibility with different import styles.
 */

// Import all of lodash
import * as lodashAll from 'lodash';

// Re-export the entire lodash library as default
export default lodashAll;

// Re-export specific functions that are used with individual imports
// Add more as needed
export const {
  // String utilities
  camelCase,
  capitalize,
  kebabCase,
  lowerCase,
  upperCase,
  upperFirst,
  
  // Array utilities
  chunk,
  compact,
  concat,
  difference,
  drop,
  filter,
  find,
  findIndex,
  first,
  flatten,
  flatMap,
  forEach,
  includes,
  join,
  last,
  map,
  reduce,
  slice,
  sortBy,
  uniq,
  uniqBy,
  
  // Object utilities
  assign,
  clone,
  cloneDeep,
  get,
  has,
  keys,
  merge,
  omit,
  pick,
  values,
  
  // Function utilities
  debounce,
  memoize,
  throttle,
  
  // Type checking
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isEqual,
  isFunction,
  isNaN,
  isNil,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  
  // Math utilities
  max,
  min,
  sum,
  sumBy
} = lodashAll;
