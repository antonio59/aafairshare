import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button'; // Adjust import path if necessary

describe('Button Component', () => {
  it('renders the button with children', () => {
    // Arrange
    const buttonText = 'Click Me';
    render(<Button>{buttonText}</Button>);

    // Act
    const buttonElement = screen.getByRole('button', { name: buttonText });

    // Assert
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    // Arrange
    render(<Button variant="destructive">Delete</Button>);

    // Act
    const buttonElement = screen.getByRole('button', { name: 'Delete' });

    // Assert
    // Check if the base class and the destructive variant class are present
    // Note: This relies on knowing the expected classes from buttonVariants
    expect(buttonElement).toHaveClass('bg-destructive');
    expect(buttonElement).toHaveClass('text-destructive-foreground');
  });

  it('is disabled when the disabled prop is true', () => {
    // Arrange
    render(<Button disabled>Disabled Button</Button>);

    // Act
    const buttonElement = screen.getByRole('button', { name: 'Disabled Button' });

    // Assert
    expect(buttonElement).toBeDisabled();
  });
});
