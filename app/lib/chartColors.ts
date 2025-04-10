import { stringToColor } from "./utils";
import { CATEGORY_COLORS } from "./constants";

// Define types with index signatures
type ColorMap = {
  [key: string]: string;
};

// Define a consistent color palette for charts
export const CHART_COLORS = {
  // User colors (distinct tones)
  users: {
    'Antonio': '#3b82f6', // Blue
    'Andres': '#a855f7',  // Purple
    'You': '#3b82f6',     // Blue (same as Antonio)
  } as ColorMap,

  // Category colors (rainbow spectrum with distinct colors)
  categories: {
    'Utilities': '#ef4444',     // Red
    'Groceries': '#f97316',     // Orange
    'Dining': '#eab308',        // Yellow
    'Transport': '#84cc16',     // Lime
    'Entertainment': '#06b6d4', // Cyan
    'Health': '#ec4899',        // Pink
    'Shopping': '#14b8a6',      // Teal
    'Subscriptions': '#6366f1', // Indigo
    'Gifts': '#d946ef',         // Fuchsia
    'Holidays': '#f472b6',      // Rose
    'Rent': '#0ea5e9',          // Sky blue
    'Insurance': '#22c55e',     // Emerald
    'Clothing': '#fb923c',      // Light orange
    'Education': '#a3e635',     // Light lime
    'Fitness': '#7c3aed',       // Violet
    'Personal': '#0d9488',      // Dark teal
    'Home': '#b45309',          // Amber
    'Pets': '#4338ca',          // Dark indigo
    'Technology': '#0f172a',    // Slate
    'Charity': '#be123c',       // Dark rose
  } as ColorMap,

  // Location colors (unique colors for common locations)
  locations: {
    'Tower Hamlets Council Tax': '#dc2626', // Red
    'Ovo Energy': '#ea580c',               // Orange
    'Ocado': '#ca8a04',                    // Yellow
    'Thames Water': '#16a34a',             // Green
    'Hyperoptic': '#0891b2',               // Cyan
    'Sainsburys': '#be185d',               // Pink
    'Amazon': '#0f766e',                   // Teal
    'Netflix': '#4f46e5',                  // Indigo
    'Etsy': '#c026d3',                     // Fuchsia
    'Airbnb': '#e11d48',                   // Rose
    'Tesco': '#2563eb',                    // Blue
    'Aldi': '#b91c1c',                     // Dark red
    'Waitrose': '#15803d',                 // Dark green
    'Uber': '#000000',                     // Black
    'Deliveroo': '#059669',                // Green
    'Just Eat': '#f59e0b',                 // Amber
    'Spotify': '#1db954',                  // Spotify green
    'Apple': '#a1a1aa',                    // Gray
    'Google': '#4285f4',                   // Google blue
    'Ikea': '#0058a3',                     // Ikea blue
  } as ColorMap
};

/**
 * Get a consistent color for a user
 * @param username The username
 * @returns A hex color code
 */
export function getUserColor(username: string): string {
  return CHART_COLORS.users[username] || stringToColor(username);
}

/**
 * Get a consistent color for a category
 * @param categoryName The category name
 * @returns A hex color code
 */
export function getCategoryColor(categoryName: string): string {
  return CHART_COLORS.categories[categoryName] ||
    // If not in our predefined map, use the category colors array in a deterministic way
    CATEGORY_COLORS[Math.abs(hashString(categoryName)) % CATEGORY_COLORS.length];
}

/**
 * Get a consistent color for a location
 * @param locationName The location name
 * @returns A hex color code
 */
export function getLocationColor(locationName: string): string {
  return CHART_COLORS.locations[locationName] ||
    // If not in our predefined map, use a darker version of the category color
    darkenColor(getCategoryColor(locationName), 0.2);
}

/**
 * Simple string hashing function to get a numeric value from a string
 * @param str The string to hash
 * @returns A numeric hash value
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Darken a hex color by a specified amount
 * @param color The hex color to darken
 * @param amount The amount to darken (0-1)
 * @returns A darkened hex color
 */
function darkenColor(color: string, amount: number): string {
  // Remove the # if it exists
  color = color.replace('#', '');

  // Parse the hex values
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Darken each component
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
