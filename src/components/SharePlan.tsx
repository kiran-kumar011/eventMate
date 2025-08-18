import React, { useState } from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

function SharePlan({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const makeUrl = () => Linking.createURL(`event/${id}`);

  const onPress = async () => {
    const url = makeUrl();
    await Clipboard.setStringAsync(url);
    setCopied(true);
    Alert.alert('Copied', 'Link copied to clipboard');
  };

  return (
    <Pressable onPress={onPress} style={styles.headerIconBtn}>
      <Ionicons
        name={copied ? 'checkmark' : 'share-outline'}
        size={24}
        style={styles.headerIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerIconBtn: {
    padding: 12,
    margin: 8,
    position: 'absolute',
    backgroundColor: '#fff',
    right: '0%',
    borderRadius: 30,
    zIndex: 1,
  },
  headerIcon: { color: '#111' },
});

export default SharePlan;
