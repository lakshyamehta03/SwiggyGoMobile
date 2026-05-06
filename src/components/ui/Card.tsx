import { View, ViewProps } from 'react-native';
import { forwardRef } from 'react';
import { cn } from './Button';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';

// NativeWind v4: register BlurView for className support
cssInterop(BlurView, { className: 'style' });

interface CardProps extends ViewProps {
  glassmorphism?: boolean;
}

export const Card = forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, glassmorphism = true, children, ...props }, ref) => {
    if (glassmorphism) {
      return (
        <BlurView
          intensity={60}
          tint="light"
          className={cn('rounded-2xl border border-white/80 overflow-hidden shadow-md bg-white/60', className)}
        >
          <View ref={ref} {...props}>
            {children}
          </View>
        </BlurView>
      );
    }

    return (
      <View
        ref={ref}
        className={cn('rounded-2xl bg-white shadow-md p-4', className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
