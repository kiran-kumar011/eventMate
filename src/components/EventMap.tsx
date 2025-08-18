import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { isValidCoord } from 'src/lib/location';

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  title?: string; // optional marker title
  description?: string; // optional marker description
  height?: number; // map height (px)
  zoomDelta?: number; // smaller = more zoomed in
  borderRadius?: number;
  disableGestures?: boolean;
};

const EventMap: React.FC<Props> = ({
  latitude = 40.7128,
  longitude = 74.006,
  title = 'Event location',
  description,
  height = 160,
  zoomDelta = 0.005,
  borderRadius = 12,
  disableGestures = true,
}) => {
  const valid = isValidCoord(latitude, longitude);

  const region: Region | undefined = useMemo(() => {
    if (!valid) return undefined;
    return {
      latitude: latitude as number,
      longitude: longitude as number,
      latitudeDelta: zoomDelta,
      longitudeDelta: zoomDelta,
    };
  }, [valid, latitude, longitude, zoomDelta]);

  if (!valid) {
    return (
      <View style={[styles.placeholder, { height, borderRadius }]}>
        <Text style={styles.placeholderEmoji}>📍</Text>
        <Text style={styles.placeholderTitle}>No map to show</Text>
        <Text style={styles.placeholderText}>
          This event doesn’t have valid coordinates yet.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ height, borderRadius, overflow: 'hidden' as const }}
      initialRegion={region}
      scrollEnabled={!disableGestures}
      zoomEnabled={!disableGestures}
      rotateEnabled={!disableGestures}
      pitchEnabled={!disableGestures}
      pointerEvents="auto"
      accessibilityLabel="Event location map"
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
    >
      <Marker
        coordinate={{
          latitude: region!.latitude,
          longitude: region!.longitude,
        }}
        title={title}
        description={description}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F3F4F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  placeholderEmoji: { fontSize: 22, marginBottom: 4 },
  placeholderTitle: { fontWeight: '600', fontSize: 14, color: '#111827' },
  placeholderText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default memo(EventMap);
