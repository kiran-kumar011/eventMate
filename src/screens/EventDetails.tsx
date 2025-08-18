import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEffect, useMemo } from 'react';
import { useEvents } from '@store/useEvents';
import { red, green } from 'src/constants';
import SharePlan from '@components/SharePlan';
import { thirtyMinsBefore, isPast } from 'src/utils/dateUtils';
import {
  scheduleReminderForEvent,
  cancelReminderForEvent,
} from 'src/lib/notifications';
import EventMap from '@components/EventMap';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { events, planIds, toggle, updateSeen } = useEvents((s) => ({
    events: s.events,
    planIds: s.planIds,
    toggle: s.togglePlan,
    updateSeen: s.updateSeen,
  }));

  const { event, saved } = useMemo(() => {
    const event = events.find((e) => e.id === id);
    return {
      event,
      saved: planIds.includes(event?.id ?? ''),
    };
  }, [events, planIds]);

  useEffect(() => {
    return updateSeen(events.find((e) => e.id === id)?.id ?? '');
  }, []);

  const handleScheduling = () => {
    const thirtyMinuteBefore = thirtyMinsBefore(new Date(event?.startAt ?? ''));
    if (isPast(thirtyMinuteBefore ?? '')) {
      return Alert.alert('Time has passed');
    }
    toggle(event?.id ?? '');

    !saved
      ? scheduleReminderForEvent({
          eventId: event?.id ?? '',
          title: event?.title ?? '',
          when: thirtyMinsBefore(new Date(event?.startAt ?? '')),
        })
      : cancelReminderForEvent(event?.id ?? '');
  };

  if (!event) {
    return (
      <View style={styles.emptyEvents}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SharePlan id={id} />
      <Image source={{ uri: event?.imageUrl }} style={styles.image} />
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>{event?.title}</Text>
        <Text style={styles.description}>
          {new Date(event?.startAt).toLocaleString()} —{' '}
          {new Date(event?.endAt).toLocaleTimeString()}
        </Text>
        <Text style={styles.description}>{event?.venueName}</Text>
        <Text style={[styles.description, styles.description1]}>
          {event?.description}
        </Text>
        <EventMap
          latitude={event.latitude}
          longitude={event.longitude}
          borderRadius={20}
        />
        <Pressable
          onPress={handleScheduling}
          style={[styles.btnWrapper, { backgroundColor: saved ? red : green }]}
        >
          <Text style={styles.btnText}>
            {saved ? 'Remove from My Plan' : 'Add to My Plan'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`addEvent?id=${id}`)}
          style={styles.btnWrapper}
        >
          <Text style={styles.btnText}>{'Edit Plan'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyEvents: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingBottom: 32 },
  image: { width: '100%', height: 220 },
  contentWrapper: { padding: 16, gap: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  description: { color: '#666', fontSize: 14 },
  description1: {
    marginTop: 10,
    lineHeight: 20,
    color: '#111827',
    fontSize: 16,
  },
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
  btnWrapper: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
