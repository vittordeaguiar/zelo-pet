import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/navigation/constants';
import { spacing } from '@/theme';

type Options = {
  withTabs?: boolean;
};

export const useScreenPadding = ({ withTabs = true }: Options = {}) => {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: spacing.xl + insets.top,
    paddingBottom: spacing['2xl'] + insets.bottom + (withTabs ? TAB_BAR_HEIGHT : 0),
  };
};
