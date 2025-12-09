import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import { EntriesProvider } from './src/hooks/useEntries';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <EntriesProvider>
          <RootNavigator />
        </EntriesProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
