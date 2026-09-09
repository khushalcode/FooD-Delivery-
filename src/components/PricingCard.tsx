/**
 * PricingCard — mirrors lib/features/my_account/widgets/pricing_card.dart.
 *
 * Simple card with an image (40x40), a formatted price (bold), and a title.
 * Used by IncomeStatementView's horizontal card list.
 */

import { Image, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/constants/theme';
import { formatPrice } from '@/utils/price';

interface PricingCardProps {
  image: ImageSourcePropType;
  title: string;
  amount: number;
  currencySymbol?: string;
  currencySymbolDirection?: 'left' | 'right';
  digitAfterDecimalPoint?: number;
}

export function PricingCard({
  image,
  title,
  amount,
  currencySymbol = '$',
  currencySymbolDirection = 'left',
  digitAfterDecimalPoint = 2,
}: PricingCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={[styles.amount, { color: colors.textPrimary }]}>
        {formatPrice(amount, {
          symbol: currencySymbol,
          direction: currencySymbolDirection,
          digits: digitAfterDecimalPoint,
        })}
      </Text>
      <Text style={[styles.title, { color: colors.disabled }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  image: {
    width: 40,
    height: 40,
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
});

export default PricingCard;
