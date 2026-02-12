import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Home, Image, Search, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/navigation/constants';
import { useThemeColors } from '@/theme';
import AgendaScreen from '@/features/agenda/AgendaScreen';
import ExploreScreen from '@/features/explore/ExploreScreen';
import HomeScreen from '@/features/home/HomeScreen';
import MemoriesScreen from '@/features/memories/MemoriesScreen';
import ProfileScreen from '@/features/profile/ProfileScreen';

type RootTabParamList = {
  Home: undefined;
  Agenda: undefined;
  Memorias: undefined;
  Explorar: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconProps = { color, size };
          switch (route.name) {
            case 'Home':
              return <Home {...iconProps} />;
            case 'Agenda':
              return <Calendar {...iconProps} />;
            case 'Memorias':
              return <Image {...iconProps} />;
            case 'Explorar':
              return <Search {...iconProps} />;
            case 'Perfil':
              return <User {...iconProps} />;
            default:
              return <Home {...iconProps} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Memorias" component={MemoriesScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
