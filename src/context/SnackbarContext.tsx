/**
 * Snackbar context — mirrors lib/common/widgets/custom_snackbar_widget.dart.
 * Provides a global toast/snackbar mechanism that any screen can call.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextValue {
  show: (message: string, type?: SnackbarType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const show = useCallback((message: string, type: SnackbarType = 'info') => {
    setState({ visible: true, message, type });
    setTimeout(() => setState((s) => ({ ...s, visible: false })), 3000);
  }, []);

  const api: SnackbarContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    warning: (m) => show(m, 'warning'),
    info: (m) => show(m, 'info'),
  };

  const bg =
    state.type === 'success'
      ? '#28A745'
      : state.type === 'error'
      ? colors.error
      : state.type === 'warning'
      ? '#FFA500'
      : '#2196F3';

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Modal
        transparent
        animationType="fade"
        visible={state.visible}
        onRequestClose={() => setState((s) => ({ ...s, visible: false }))}
      >
        <View style={styles.overlay} pointerEvents="none">
          <View
            style={[
              styles.snackbar,
              {
                backgroundColor: bg,
                marginTop: insets.top + Dimensions.paddingSizeSmall,
              },
            ]}
          >
            <Text style={[styles.text, { color: '#FFFFFF' }]}>{state.message}</Text>
            <TouchableOpacity
              onPress={() => setState((s) => ({ ...s, visible: false }))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.dismiss, { color: '#FFFFFFCC' }]}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Dimensions.paddingSizeDefault,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.paddingSizeDefault,
    paddingVertical: Dimensions.paddingSizeSmall,
    borderRadius: Dimensions.radiusDefault,
    minWidth: '100%',
    maxWidth: '100%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  text: {
    ...Typography.body,
    flex: 1,
    flexWrap: 'wrap',
  },
  dismiss: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: Dimensions.paddingSizeSmall,
  },
});

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used inside SnackbarProvider');
  }
  return ctx;
}
