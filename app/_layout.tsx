import { useCallback, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { screenOptions } from 'src/constants';
import { Ionicons } from '@expo/vector-icons';
import { bootstrapNotifications } from 'src/lib/notifications';
import { ensureLocationPermission } from 'src/lib/location';
// import { runEventAssetUpdate } from 'src/services/eventUpdates';

export default function RootLayout() {
  useEffect(() => {
    bootstrapNotifications();
    ensureLocationPermission();
    // enable this line to check the logic to re-hydrate zustand with assets/data/event_updates.json
    // runEventAssetUpdate();
  }, []);

  const onBackPress = useCallback(() => {
    router.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="event/[id]"
          options={{
            headerShown: true,
            title: 'Event',
            headerLeft: () => (
              <Ionicons
                name="chevron-back-sharp"
                size={24}
                onPress={onBackPress}
              />
            ),
          }}
        />
        <Stack.Screen
          name="addEvent"
          options={{ headerShown: true, title: 'Add Event' }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
