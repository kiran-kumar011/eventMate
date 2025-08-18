import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@store/useEvents';
import { activeIcon, inactiveIcon, iconSize } from 'src/constants';
import type { Event } from '@types/Event';
import {
  scheduleReminderForEvent,
  cancelReminderForEvent,
} from 'src/lib/notifications';
import { isPast, thirtyMinsBefore } from 'src/utils/dateUtils';

export default function EventCard({ event }: { event: Event }) {
  const planIds = useEvents((s) => s.planIds);
  const togglePlan = useEvents((s) => s.togglePlan);
  const isSaved = planIds.includes(event.id);

  const handleScheduling = () => {
    const thirtyMinuteBefore = thirtyMinsBefore(new Date(event.startAt));
    if (isPast(thirtyMinuteBefore)) {
      return Alert.alert(`Time has passed${thirtyMinsBefore}`);
    }
    togglePlan(event.id);

    !isSaved
      ? scheduleReminderForEvent({
          eventId: event.id,
          title: event.title,
          when: thirtyMinsBefore(new Date(event.startAt)),
        })
      : cancelReminderForEvent(event.id);
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>
          {new Date(event.startAt).toLocaleString()} • {event.venueName}
        </Text>
        <View style={styles.actionsWrapper}>
          <Link href={`/event/${event.id}`} asChild>
            <Pressable style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsTxt}>View details</Text>
            </Pressable>
          </Link>
          <View style={styles.iconsWrapper}>
            <Pressable onPress={handleScheduling} style={styles.icon}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={iconSize}
                color={isSaved ? activeIcon : inactiveIcon}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {event.recentlyUpdated ? (
        <View style={styles.card}>
          <Text style={styles.updatedBadge}>Updated</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
  },
  image: { width: '100%', height: 160 },
  contentWrapper: { padding: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  description: { color: '#111827', marginTop: 4 },
  actionsWrapper: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  viewDetailsTxt: { color: '#fff', fontWeight: '600' },
  iconsWrapper: { flexDirection: 'row' },
  icon: { padding: 8 },
  updatedTxt: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFE8A3',
  },
  card: {
    backgroundColor: '#93C5FD',
    paddingVertical: 4,
    alignItems: 'center',
  },
  updatedBadge: {
    fontSize: 11,
    fontWeight: '700',

    letterSpacing: 0.4,
    includeFontPadding: false,
  },
});
