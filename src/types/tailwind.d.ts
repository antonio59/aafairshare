/**
 * Type declarations for Tailwind CSS
 * Compatible with Tailwind CSS 4.x
 */
declare module 'tailwindcss/types' {
  export interface Config {
    content: string[];
    darkMode?: 'media' | 'class' | false;
    theme?: {
      extend?: Record<string, any>;
      [key: string]: any;
    };
    plugins?: any[];
    future?: {
      hoverOnlyWhenSupported?: boolean;
      respectDefaultRingColorOpacity?: boolean;
      disableColorOpacityUtilitiesByDefault?: boolean;
      relativeContentPathsByDefault?: boolean;
    };
  }
}

/**
 * Extended theme type definitions
 */
declare module 'tailwindcss/types/generated/default-theme' {
  export interface DefaultTheme {
    // Custom theme extensions
    colors: Record<string, Record<string, string> | string>;
    fontFamily: Record<string, string[]>;
    borderRadius: Record<string, string>;
    spacing: Record<string, string>;
    animation: Record<string, string>;
    keyframes: Record<string, Record<string, Record<string, string>>>;
  }
}
