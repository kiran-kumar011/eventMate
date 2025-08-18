import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export async function pickAndPersistImage(
  prefix = 'event',
): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
    allowsEditing: false,
    allowsMultipleSelection: false,
    selectionLimit: 1,
  });

  if (res.canceled || !res.assets?.length) return null;

  const src = res.assets[0].uri;
  const ext = src.split('.').pop() || 'jpg';
  const dest = `${FileSystem.documentDirectory}${prefix}-${Date.now()}.${ext}`;

  try {
    await FileSystem.copyAsync({ from: src, to: dest });
    return dest;
  } catch (e) {
    console.warn('Failed to persist image', e);
    return null;
  }
}
