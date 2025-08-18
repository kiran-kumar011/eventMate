// SmartImage.tsx
import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Image, type ImageProps } from 'expo-image';
const { width, height } = Dimensions.get('window');
type SmartImageProps = {
  /** Anything expo-image accepts: uri string, { uri, headers }, require('...'), etc. */
  source: ImageProps['source'];
  /** Width/height required for proper layout (can be numbers or percentage strings). */
  width: number | string;
  height: number | string;

  /** Optional BlurHash placeholder string */
  blurhash?: string;

  /** Round corners */
  borderRadius?: number;

  /** Cover | contain | fill | none | scale-down */
  contentFit?: ImageProps['contentFit'];

  /** Cross-fade in ms (0 to disable) */
  transition?: number;

  /** 'none' | 'disk' | 'memory' | 'memory-disk' */
  cachePolicy?: ImageProps['cachePolicy'];

  /** 'rgb' to reduce Android memory (drops alpha), or 'rgba' (default) */
  decodeFormat?: ImageProps['decodeFormat'];

  /** Optional wrapper style (e.g., margins) */
  containerStyle?: ViewStyle;

  /** Optional press handler */
  onPress?: () => void;

  /** Shown if image fails to load */
  fallbackText?: string;
};

export default function SmartImage({
  source,
  width,
  height,
  blurhash,
  borderRadius = 12,
  contentFit = 'cover',
  transition = 250,
  cachePolicy = 'memory-disk',
  decodeFormat = 'rgba',
  containerStyle,
  onPress,
  fallbackText = 'Image unavailable',
}: SmartImageProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const body = failed ? (
    <View style={[styles.fallback, { width, height, borderRadius }]}>
      <Text style={styles.fallbackText}>{fallbackText}</Text>
    </View>
  ) : (
    <>
      <Image
        source={source}
        style={{ width, height, borderRadius }}
        contentFit={contentFit}
        placeholder={blurhash}
        transition={transition}
        cachePolicy={cachePolicy}
        decodeFormat={decodeFormat}
        allowDownscaling
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        { width, height, borderRadius, overflow: 'hidden' },
        containerStyle,
      ]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
  },
  fallbackText: {
    fontSize: 12,
    color: '#666',
  },
});
