import { PressableProps } from 'react-native';
import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Pressable, Text } from '@/src/tw';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends PressableProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  textClassName?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant = 'default', size = 'default', textClassName, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors',
          {
            'bg-primary': variant === 'default',
            'border border-input bg-background': variant === 'outline',
            'bg-secondary': variant === 'secondary',
            'bg-transparent': variant === 'ghost',
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text
            className={cn(
              'font-semibold text-base',
              {
                'text-primary-foreground': variant === 'default',
                'text-secondary-foreground': variant === 'secondary',
                'text-foreground': variant === 'outline' || variant === 'ghost',
              },
              textClassName
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
