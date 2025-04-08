import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Tooltip } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip content={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">
          {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        </span>
      </Button>
    </Tooltip>
  );
}
