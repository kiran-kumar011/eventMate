import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFound() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 18 }}>This screen doesn't exist.</Text>
      <Link href="/">
        <Text style={{ color: '#111827', fontWeight: '700' }}>Go to home</Text>
      </Link>
    </View>
  );
}
