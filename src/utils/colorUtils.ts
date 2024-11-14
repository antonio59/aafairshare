import type { Category } from '../types';

// Generate a random HSL color with good saturation and lightness for visibility
const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 20) + 60; // 60-80%
  const lightness = Math.floor(Math.random() * 20) + 35; // 35-55%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Convert HSL color to hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Parse HSL color string to components
const parseHSL = (hsl: string): { h: number; s: number; l: number } => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) throw new Error('Invalid HSL color format');
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
};

// Calculate color difference using HSL
const getColorDifference = (color1: string, color2: string): number => {
  const c1 = parseHSL(color1);
  const c2 = parseHSL(color2);
  
  // Calculate differences in each component
  const hueDiff = Math.abs(c1.h - c2.h);
  const satDiff = Math.abs(c1.s - c2.s);
  const lightDiff = Math.abs(c1.l - c2.l);
  
  // Weight the differences (hue difference is most important)
  return hueDiff * 1.5 + satDiff + lightDiff;
};

// Generate a unique color that's different enough from existing colors
export const generateUniqueColor = (existingCategories: Category[]): string => {
  const MIN_COLOR_DIFFERENCE = 50; // Minimum difference threshold
  const MAX_ATTEMPTS = 50; // Maximum attempts to find a unique color
  
  const existingColors = existingCategories.map(c => c.color)
    .filter(color => color.startsWith('hsl')); // Only consider HSL colors
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const newColor = generateRandomColor();
    
    // Check if the new color is different enough from all existing colors
    const isDifferentEnough = existingColors.every(existingColor => {
      try {
        return getColorDifference(newColor, existingColor) > MIN_COLOR_DIFFERENCE;
      } catch {
        return true; // If we can't parse the existing color, consider it different
      }
    });
    
    if (isDifferentEnough || existingColors.length === 0) {
      // Convert to hex for better compatibility
      const { h, s, l } = parseHSL(newColor);
      return hslToHex(h, s, l);
    }
  }
  
  // If we couldn't find a unique color after MAX_ATTEMPTS, generate a random hex color
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};
