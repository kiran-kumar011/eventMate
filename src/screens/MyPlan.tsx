import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useEvents } from 'src/store/useEvents';
import EventCard from '@components/EventCard';

export default function MyPlan() {
  const { events, planIds } = useEvents((s) => ({
    events: s.events,
    planIds: s.planIds,
  }));
  const planned = events?.filter((e) => planIds?.includes(e.id));

  if (planned.length === 0) {
    return (
      <View style={styles.falbackUI}>
        <Text style={styles.fallbackTxt}>
          No sessions saved yet. Tap the bookmark on any card.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={planned}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, padding: 12, backgroundColor: '#f9fafb' },
  falbackUI: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTxt: { fontSize: 18, color: '#666' },
});
