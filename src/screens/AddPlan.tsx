import {
  Text,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useEvents } from '@store/useEvents';
import { LatLng, type Event } from 'src/types/Event';
import { TimePickerField, EventMap, Field } from '@components/index';
import { addMinutes } from 'src/utils/dateUtils';

const iso = (d: Date): string | null => d.toISOString();

export default function AddEvent() {
  const router = useRouter();

  const { addDraft, updateEvent, events } = useEvents((s) => ({
    addDraft: s.addDraft,
    updateEvent: s.updateEvent,
    events: s.events,
  }));

  const { id: paramId, eventId: paramEventId } = useLocalSearchParams<{
    id?: string;
    eventId?: string;
  }>();
  const targetId = (paramId || paramEventId) ?? '';

  const { seedEvent } = useMemo(() => {
    return { seedEvent: events.find((e) => e.id === targetId) };
  }, [events, targetId]);

  const isEdit = !!seedEvent;

  // Form state
  const [title, setTitle] = useState('');
  const [venueName, setVenue] = useState('');
  const [startAt, setStart] = useState(iso(addMinutes(new Date(), 30)));
  const [endAt, setEnd] = useState(iso(addMinutes(new Date(), 60)));
  const [latLng, setCoords] = useState<LatLng>({
    latitude: null,
    longitude: null,
  });
  const [description, setDesc] = useState('');

  const [localImageUri, setLocalImageUri] = useState<string>('');

  // Prefill once if editing
  const hydrated = useRef(false);
  useEffect(() => {
    if (!seedEvent || hydrated.current) return;

    setTitle(seedEvent.title ?? '');
    setVenue(seedEvent.venueName ?? '');
    setStart(seedEvent.startAt ?? iso(new Date()));
    setEnd(seedEvent.endAt ?? new Date(Date.now() + 60 * 60 * 1000));
    setDesc(seedEvent.description ?? '');
    setCoords({
      longitude: seedEvent.longitude ?? null,
      latitude: seedEvent.latitude ?? null,
    });
    if (seedEvent.imageUrl) setLocalImageUri(seedEvent.imageUrl);
    hydrated.current = true;
  }, [seedEvent]);

  const pickImage = async () => {
    const { status, canAskAgain, accessPrivileges } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        canAskAgain
          ? 'We need Photos access to pick an image.'
          : 'Photos access is denied. Enable it in Settings > eventMate.',
      );
      return;
    }

    const launch = async () =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        exif: false,
      });

    let res = await launch();

    if (res.canceled && accessPrivileges === 'limited') {
      res = await launch();
    }

    if (res.canceled || !res.assets?.length) return;

    const src = res.assets[0].uri; // file:// (Expo returns a local copy already)
    const ext = (src.split('.').pop() || 'jpg').split('?')[0];
    const dest = `${FileSystem.documentDirectory}event-${Date.now()}.${ext}`;

    try {
      await FileSystem.copyAsync({ from: src, to: dest });
      setLocalImageUri(dest);
    } catch (e) {
      Alert.alert('Error', 'Could not save image locally.');
    }
  };

  const onSubmit = () => {
    if (!title.trim()) return Alert.alert('Validation', 'Title is required');
    if (!venueName.trim())
      return Alert.alert('Validation', 'Venue is required');
    if (!startAt || !endAt)
      return Alert.alert(
        'Validation',
        'Use valid ISO timestamps for start/end',
      );
    if (Date.parse(startAt) >= Date.parse(endAt))
      return Alert.alert('Validation', 'Start must be before end');

    const lat = latLng.latitude;
    const lon = latLng.longitude;
    if (Number.isNaN(lat) || Number.isNaN(lon))
      return Alert.alert('Validation', 'Latitude/Longitude must be numbers');

    // Build optimistic draft (keep existing image if no new one chosen)
    const current = new Date().toISOString();
    const e: Event = {
      id: isEdit ? seedEvent.id : `draft-${Date.now()}`,
      title: title.trim(),
      startAt,
      endAt,
      venueName: venueName.trim(),
      latitude: lat!,
      longitude: lon!,
      description:
        description.trim() || (isEdit ? 'Edited draft' : 'Draft event'),
      imageUrl:
        localImageUri ||
        seedEvent?.imageUrl ||
        `https://picsum.photos/seed/${Math.random()
          .toString(36)
          .slice(2)}/800/500`,
      updatedAt: current,
      createdAt: isEdit ? seedEvent.createdAt : current,
    };

    isEdit ? updateEvent(e) : addDraft(e);
    router.back();
  };

  const setNewCoords = (latLng: LatLng) => {
    if (!seedEvent) {
      setCoords(latLng);
    }
  };

  const previewUri = localImageUri || seedEvent?.imageUrl || '';
  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>
          {isEdit ? 'Edit Event' : 'Add Event (Draft)'}
        </Text>
        <Field
          label={'Title'}
          value={title}
          setter={setTitle}
          rest={{ placeholder: 'Event title' }}
        />
        <Field
          label={'Venue'}
          value={venueName}
          setter={setVenue}
          rest={{ placeholder: 'Hall A' }}
        />
        <TimePickerField
          label="Start time"
          value={new Date(startAt ?? new Date())}
          onChange={(date) => setStart(iso(date))}
          is24Hour={false}
          display={Platform.select({ ios: 'spinner', android: 'clock' })}
        />
        <TimePickerField
          label="End time"
          value={new Date(endAt ?? new Date())}
          onChange={(date) => setEnd(iso(date))}
          is24Hour={false} // set false for 12-hour; omit to follow device setting
          display={Platform.select({ ios: 'spinner', android: 'clock' })}
        />
        <EventMap
          disableGestures={false}
          height={160}
          latitude={latLng?.latitude}
          longitude={latLng?.longitude}
          setCoords={setNewCoords}
        />
        {!!previewUri && (
          <Image
            source={{ uri: previewUri }}
            style={styles.localImage}
            resizeMode="cover"
          />
        )}
        <Field
          label="Description"
          value={description}
          setter={setDesc}
          rest={{ placeholder: 'What is this about?' }}
        />
        <Pressable onPress={pickImage} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnTxt}>
            {localImageUri ? 'Change Image' : 'Pick Image'}
          </Text>
        </Pressable>

        <Pressable onPress={onSubmit} style={styles.btn}>
          <Text style={styles.btnTxt}>
            {isEdit ? 'Save Draft' : 'Add Event (Draft)'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { padding: 16, gap: 12 },
  header: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  btn: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  btnTxt: { color: 'white', fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnTxt: { color: '#111827', fontWeight: '600' },
  localImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  field: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  label: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  value: { fontSize: 16, color: '#0F172A', fontWeight: '600' },
});
