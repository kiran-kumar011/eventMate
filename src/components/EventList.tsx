import { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { View, StyleSheet, Text } from 'react-native';
import EventCard from './EventCard';
import { useEvents } from '@store/useEvents';
import { Event } from '@types/Event';

export default function EventList() {
  const events = useEvents((s) => s.events);

  const ListEmptyComponent = () => {
    return (
      <View style={styles.container}>
        <Text>Add Event and Plan your day</Text>
      </View>
    );
  };

  const RenderItem = useCallback(
    ({ item }: { item: Event }) => {
      return (
        <View>
          <EventCard event={item} />
        </View>
      );
    },
    [events],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={events ?? []}
        keyExtractor={(item) => item.id}
        renderItem={RenderItem}
        contentContainerStyle={styles.contentContainerStyle}
        ListEmptyComponent={ListEmptyComponent}
        estimatedItemSize={72}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, flex: 1 },
  contentContainerStyle: { paddingBottom: 44 },
  itemSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#000' },
});
