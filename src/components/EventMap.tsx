import React, { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import MapView, {
  Marker,
  Region,
  PROVIDER_GOOGLE,
  MapPressEvent,
} from 'react-native-maps';
import { isValidCoord, Location } from 'src/lib/location';
import { EventMapProps } from 'src/types/Event';

import { useEvents } from '@store/useEvents';

const EventMap: React.FC<EventMapProps> = ({
  latitude,
  longitude,
  title = 'Event location',
  description = 'Pin Location',
  height,
  zoomDelta = 0.005,
  borderRadius = 12,
  disableGestures = true,
  setCoords = () => {},
}) => {
  const { setLastKnownLocation } = useEvents((s) => ({
    setLastKnownLocation: s.setLastKnownLocation,
  }));
  const valid = isValidCoord(latitude, longitude);

  const mapRef = useRef<MapView>(null);

  const region: Region | undefined = useMemo(() => {
    if (!valid) return undefined;
    return {
      latitude: latitude as number,
      longitude: longitude as number,
      latitudeDelta: zoomDelta,
      longitudeDelta: zoomDelta,
    };
  }, [valid, latitude, longitude, zoomDelta]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Location permission is required to pick a place.',
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});

      setLastKnownLocation(pos.coords.latitude, pos.coords.longitude);
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
      requestAnimationFrame(() => {
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            zoom: 16,
          },
          { duration: 700 },
        );
      });
    })();
  }, []);

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

  const moveToCordinates = (e: MapPressEvent) => {
    const { latitude, longitude } = e?.nativeEvent?.coordinate;
    setCoords({ latitude, longitude });
  };

  return (
    <MapView
      ref={mapRef}
      style={{
        height,
        borderRadius,
        overflow: 'hidden',
      }}
      initialRegion={region}
      scrollEnabled={!disableGestures}
      zoomEnabled={!disableGestures}
      rotateEnabled={!disableGestures}
      pitchEnabled={!disableGestures}
      pointerEvents="auto"
      accessibilityLabel="Event location map"
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      toolbarEnabled
      showsMyLocationButton
      showsUserLocation
      onPress={moveToCordinates}
    >
      {region && (
        <Marker coordinate={region} title={title} description={description} />
      )}
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
    borderRadius: 10,
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
