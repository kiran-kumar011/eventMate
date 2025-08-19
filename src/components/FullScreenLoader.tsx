// src/components/FullScreenLoader.tsx
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export default function FullScreenLoader({
  label = 'Loading…',
  style,
}: {
  label?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator size="large" />
      <Text style={styles.txt}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
  },
  txt: { color: '#444', fontSize: 16 },
});
