/**
 * CustomAlertDialog — mirrors lib/common/widgets/custom_alert_dialog_widget.dart.
 * Modal-style alert with icon, title, description, and OK / Cancel actions.
 */

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { CustomButton } from './CustomButton';

interface CustomAlertDialogProps {
  visible: boolean;
  title?: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onCancel?: () => void;
  onOkPressed?: () => void;
  okText?: string;
  cancelText?: string;
  showCancel?: boolean;
  children?: ReactNode;
}

export function CustomAlertDialog({
  visible,
  title,
  description,
  icon = 'warning-outline',
  onCancel,
  onOkPressed,
  okText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  children,
}: CustomAlertDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlayBg }]}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name={icon} size={48} color={colors.primary} />
          </View>

          {title ? (
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          ) : null}

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>

          {children}

          <View style={styles.actions}>
            {showCancel ? (
              <CustomButton
                buttonText={cancelText}
                variant="outline"
                onPress={onCancel}
                style={{ flex: 1, marginRight: Dimensions.paddingSizeSmall }}
              />
            ) : null}
            <CustomButton
              buttonText={okText}
              onPress={onOkPressed}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Dimensions.paddingSizeLarge,
  },
  dialog: {
    width: '100%',
    borderRadius: Dimensions.radiusLarge,
    padding: Dimensions.paddingSizeLarge,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Dimensions.paddingSizeDefault,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Dimensions.paddingSizeExtraSmall,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Dimensions.paddingSizeLarge,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
});
