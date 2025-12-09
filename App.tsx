import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { EntriesProvider } from './src/hooks/useEntries';
import { SettingsProvider } from './src/hooks/useSettings';
import RootNavigator from './src/navigation/RootNavigator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <EntriesProvider>
          <SettingsProvider>
            <RootNavigator />
          </SettingsProvider>
        </EntriesProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
