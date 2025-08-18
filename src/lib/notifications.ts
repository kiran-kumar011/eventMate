import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INDEX_KEY = '@reminders:index';

type ReminderIndex = Record<string, { id: string; whenISO: string }>;

async function loadIndex(): Promise<ReminderIndex> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveIndex(ix: ReminderIndex) {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(ix));
}

/** Schedule a reminder at an absolute Date for an event. */
export async function scheduleReminderForEvent(opts: {
  eventId: string;
  title: string;
  when: Date; // exact time the notif should fire
  body?: string;
}) {
  if (opts.when.getTime() <= Date.now()) {
    throw new Error('Cannot schedule a reminder in the past.');
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Reminder: ${opts.title}`,
      body: opts.body ?? '',
      data: { eventId: opts.eventId }, // <-- critical: tag with eventId
    },
    trigger: opts.when, // Date trigger
  });

  const ix = await loadIndex();
  ix[opts.eventId] = { id, whenISO: opts.when.toISOString() };
  await saveIndex(ix);
  Alert.alert('Scheduled event');
  return id;
}

/** Cancel an event's scheduled reminder (if any) and clear from index. */
export async function cancelReminderForEvent(eventId: string) {
  const ix = await loadIndex();
  const entry = ix[eventId];

  // Cancel by index id if present
  if (entry?.id) {
    await Notifications.cancelScheduledNotificationAsync(entry.id);
    delete ix[eventId];
    await saveIndex(ix);
  } else {
    // Fallback: scan OS and cancel any matches (also cleans up duplicates)
    const all = await Notifications.getAllScheduledNotificationsAsync();
    let didCancel = false;
    for (const req of all) {
      const data = (req.content?.data ?? {}) as any;
      if (String(data.eventId) === eventId) {
        await Notifications.cancelScheduledNotificationAsync(req.identifier);
        didCancel = true;
      }
    }
    Alert.alert(`Scheduled event${didCancel}`);
    if (didCancel) {
      delete ix[eventId];
      await saveIndex(ix);
    }
  }
}

export async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function scheduleOneShotTest(secondsFromNow = 5) {
  await ensureAndroidChannel();

  const when = new Date(Date.now() + secondsFromNow * 1000); // <-- Date trigger (no enum)
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Test', body: `Fired in ${secondsFromNow}s` },
    trigger: when,
  });
}

export async function listScheduled() {
  const list = await Notifications.getAllScheduledNotificationsAsync();
  console.log('[Notif] Scheduled:', list);
  return list;
}

export async function bootstrapNotifications() {
  try {
    // 1) Create a channel FIRST (needed for Android 13 prompt + visual settings)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX, // heads-up
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        // sound: 'my_sound.wav' // only if you added a custom sound
      });
    }

    // 2) Ask permission (after channel exists on Android 13+)
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();

    // 3) Foreground presentation handler — **must** return a "show" flag
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // keep all of these true to be safe across SDKs
        shouldShowAlert: true, // (works cross-platform)
        shouldShowBanner: true, // (iOS style; harmless on Android)
        shouldShowList: true, // (iOS Notification Center)
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    Alert.alert('Please enable Notifications');
  }
  console.log(
    '[Notif] Permissions:',
    await Notifications.getPermissionsAsync(),
  );
  console.log(
    '[Notif] Channels:',
    await Notifications.getNotificationChannelsAsync(),
  );
  console.log(
    '[Notif] Scheduled (initial):',
    await Notifications.getAllScheduledNotificationsAsync(),
  );
}
