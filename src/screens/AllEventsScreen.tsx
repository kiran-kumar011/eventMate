import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import EventList from '@components/EventList';
import { useEvents } from '@store/useEvents';

export default function AllEvents() {
  const { reload, reloadEvents } = useEvents((s) => {
    return {
      reload: s?.meta?.hasUpdated ?? false,
      reloadEvents: s.updateWithUpdatedEvents,
    };
  });
  return (
    <View style={styles.container}>
      <EventList />
      <View style={styles.btnWrapper}>
        <View style={styles.centerWrap}>
          <TouchableOpacity
            disabled={!reload}
            style={[
              styles.roundButton,
              { backgroundColor: reload ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.4)' },
            ]}
            onPress={reloadEvents}
          >
            <Ionicons name="reload" size={30} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerWrap}>
          <TouchableOpacity
            style={styles.roundButton}
            activeOpacity={0.6}
            onPress={() => router.push('addEvent')}
          >
            <Ionicons name="add" size={30} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWrapper: {
    position: 'absolute',
    top: '90%',
    // right: '5%',
    flexDirection: 'row',
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: { color: '#fff' },
});
