/**
 * CustomButton — mirrors lib/common/widgets/custom_button_widget.dart.
 * A primary CTA button with loading state, optional icon, and variant support.
 */

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type DimensionValue, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { COLORS } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';

interface CustomButtonProps {
  buttonText?: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
  textStyle?: object;
  children?: ReactNode;
}

export function CustomButton({
  buttonText,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  icon,
  width = '100%',
  height = 50,
  style,
  textStyle,
  children,
}: CustomButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || isLoading;

  const bgByVariant: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.disabled,
    outline: 'transparent',
    danger: colors.error,
    success: colors.success,
    ghost: 'transparent',
  };

  const textColorByVariant: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: colors.primary,
    danger: '#FFFFFF',
    success: '#FFFFFF',
    ghost: colors.primary,
  };

  const borderColorByVariant: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.disabled,
    outline: colors.primary,
    danger: colors.error,
    success: colors.success,
    ghost: 'transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: bgByVariant[variant],
          borderColor: borderColorByVariant[variant],
          borderWidth: variant === 'outline' ? 1 : 0,
          width,
          height,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColorByVariant[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          {buttonText ? (
            <Text
              style={[
                styles.text,
                { color: textColorByVariant[variant] },
                textStyle,
              ]}
            >
              {buttonText}
            </Text>
          ) : null}
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Dimensions.radiusDefault,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Dimensions.paddingSizeDefault,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    ...Typography.button,
    textAlign: 'center',
  },
});

// Re-export for convenience
export { COLORS };
