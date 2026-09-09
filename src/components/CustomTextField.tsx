/**
 * CustomTextField — mirrors lib/common/widgets/custom_text_field_widget.dart.
 * Supports: label, hint, password toggle, phone (country code), error, icon.
 */

import { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';

interface CustomTextFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  labelText?: string;
  hintText?: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  isPhone?: boolean;
  countryDialCode?: string;
  onCountryChanged?: () => void;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export const CustomTextField = forwardRef<TextInput, CustomTextFieldProps>(
  (
    {
      labelText,
      hintText,
      value,
      onChangeText,
      isPassword = false,
      isPhone = false,
      countryDialCode,
      onCountryChanged,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const isSecure = isPassword && !showPassword;

    return (
      <View style={[styles.container, containerStyle]}>
        {labelText ? (
          <Text style={[styles.label, { color: colors.textPrimary }]}>{labelText}</Text>
        ) : null}

        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.inputFill,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          {leftIcon ? (
            <Ionicons
              name={leftIcon}
              size={20}
              color={colors.textSecondary}
              style={styles.leftIcon}
            />
          ) : null}

          {isPhone && countryDialCode ? (
            <TouchableOpacity
              onPress={onCountryChanged}
              style={styles.dialCode}
              activeOpacity={0.7}
            >
              <Text style={[styles.dialCodeText, { color: colors.textPrimary }]}>
                {countryDialCode}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={hintText}
            placeholderTextColor={colors.hint}
            secureTextEntry={isSecure}
            keyboardType={isPhone ? 'phone-pad' : rest.keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              { color: colors.textPrimary },
            ]}
            {...rest}
          />

          {isPassword ? (
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              style={styles.rightIcon}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

CustomTextField.displayName = 'CustomTextField';

const styles = StyleSheet.create({
  container: {
    marginBottom: Dimensions.paddingSizeDefault,
  },
  label: {
    ...Typography.label,
    marginBottom: Dimensions.paddingSizeExtraSmall,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Dimensions.radiusDefault,
    borderWidth: 1,
    paddingHorizontal: Dimensions.paddingSizeDefault,
    height: 52,
  },
  leftIcon: {
    marginRight: Dimensions.paddingSizeSmall,
  },
  dialCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(150,150,150,0.3)',
    paddingRight: Dimensions.paddingSizeSmall,
    marginRight: Dimensions.paddingSizeSmall,
  },
  dialCodeText: {
    ...Typography.body,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 0,
    ...Typography.body,
  },
  rightIcon: {
    paddingLeft: Dimensions.paddingSizeSmall,
  },
  error: {
    ...Typography.caption,
    marginTop: 4,
  },
});
