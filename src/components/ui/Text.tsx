import { TextProps as RNTextProps } from 'react-native';
import { forwardRef } from 'react';
import { cn } from './Button';
import { Text as TwText } from '@/src/tw';

export interface TextProps extends RNTextProps {
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'muted';
}

export const Text = forwardRef<React.ElementRef<typeof TwText>, TextProps>(
  ({ className, variant = 'p', ...props }, ref) => {
    return (
      <TwText
        ref={ref}
        className={cn(
          'text-foreground',
          {
            'text-2xl font-bold': variant === 'h1',
            'text-xl font-semibold': variant === 'h2',
            'text-lg font-semibold': variant === 'h3',
            'text-base font-medium': variant === 'h4',
            'text-base': variant === 'p',
            'text-sm text-muted-foreground': variant === 'muted',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
