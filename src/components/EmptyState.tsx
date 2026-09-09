/**
 * EmptyStateWidget — reusable empty/placeholder view shown when lists are empty.
 */

import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { useTheme } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Dimensions } from '@/constants/dimensions';
import { Images } from '@/constants/images';

interface EmptyStateProps {
  image?: ImageSourcePropType;
  title: string;
  description?: string;
}

export function EmptyState({
  image = Images.emptyWallet,
  title,
  description,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Dimensions.paddingSizeExtraLarge,
    paddingVertical: Dimensions.paddingSizeOverLarge,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: Dimensions.paddingSizeDefault,
    opacity: 0.6,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Dimensions.paddingSizeExtraSmall,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
  },
});
