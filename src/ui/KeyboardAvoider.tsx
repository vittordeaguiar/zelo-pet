import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardAvoiderProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function KeyboardAvoider({ children, style }: KeyboardAvoiderProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={style}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
