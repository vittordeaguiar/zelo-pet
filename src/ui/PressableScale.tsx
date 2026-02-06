import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  activeOpacity?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  activeOpacity = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: scaleTo,
        useNativeDriver: true,
        speed: 30,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: activeOpacity,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        animateIn();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateOut();
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }], opacity }]}
    >
      {children}
    </AnimatedPressable>
  );
}
