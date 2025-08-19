import { useCallback, useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { screenOptions } from 'src/constants';
import { Ionicons } from '@expo/vector-icons';
import { bootstrapNotifications } from 'src/lib/notifications';
import { ensureLocationPermission } from 'src/lib/location';
import { useZustandHydrated } from 'src/hooks/useZustandHydrated';
import { useEvents } from '@store/useEvents';
import FullScreenLoader from '@components/FullScreenLoader';
// import { runEventAssetUpdate } from 'src/services/eventUpdates';

export default function RootLayout() {
  const [loading, setLoading] = useState(false);
  const hydrated = useZustandHydrated(useEvents as any);

  useEffect(() => {
    (async () => {
      try {
        await bootstrapNotifications();
        await ensureLocationPermission();
      } catch (e) {
      } finally {
        setLoading(true);
      }
    })();
    // enable this line to check the logic to re-hydrate zustand with assets/data/event_updates.json
    // runEventAssetUpdate();
  }, []);

  const onBackPress = useCallback(() => {
    router.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, []);

  if (!(hydrated && loading)) {
    return <FullScreenLoader label="Loading your data…" />;
  }

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
