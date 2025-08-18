import React, { useMemo, useState } from 'react';
import {
  Platform,
  Modal,
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { formatTime, mergeTime, toValidDate } from 'src/utils/dateUtils';

type Display = 'default' | 'spinner' | 'clock' | 'compact' | 'inline'; // iOS supports 'inline' and 'compact'

export interface TimePickerFieldProps {
  label?: string;
  value: string | null; // full Date; you can ignore the date part if you only need time
  onChange: (date: Date) => void;
  is24Hour?: boolean; // default: device setting
  display?: Display; // default: 'default'
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30; // iOS only
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onChange,
  is24Hour,
  display = 'default',
  minuteInterval,
}) => {
  const [iosVisible, setIosVisible] = useState(false);
  const [tempTime, setTempTime] = useState<string>(
    value ?? new Date().toLocaleString(),
  );

  const shownText = useMemo(
    () => formatTime(value, is24Hour),
    [value, is24Hour],
  );

  const openPicker = () => {
    const base = toValidDate(value) ?? new Date().toLocaleString;

    if (Platform.OS === 'android') {
      // Android uses a native dialog
      DateTimePickerAndroid.open({
        value: base,
        mode: 'time',
        is24Hour,
        display,
        onChange: (event: DateTimePickerEvent, selected?: Date) => {
          if (event.type === 'set' && selected) {
            // If you care about keeping the original date part, merge:
            const next = value ? mergeTime(value, selected) : selected;
            onChange(next);
          }
          // 'dismissed' requires no action
        },
      } as any); // .open exists on the module default export in this package
    } else {
      // iOS: show a modal with inline spinner/compact/etc.
      setTempTime(value);
      setIosVisible(true);
    }
  };

  const confirmIos = () => {
    const next = value ? mergeTime(value, tempTime) : tempTime;
    onChange(next);
    setIosVisible(false);
  };

  const cancelIos = () => setIosVisible(false);

  return (
    <>
      <Pressable onPress={openPicker} style={styles.field}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.value}>{shownText}</Text>
      </Pressable>

      {/* iOS modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={iosVisible} transparent animationType="slide">
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Pressable onPress={cancelIos} hitSlop={10}>
                  <Text style={styles.link}>Cancel</Text>
                </Pressable>
                <Text style={styles.title}>{label ?? 'Pick time'}</Text>
                <Pressable onPress={confirmIos} hitSlop={10}>
                  <Text style={styles.link}>Done</Text>
                </Pressable>
              </View>

              <DateTimePicker
                mode="time"
                value={tempTime}
                onChange={(_, d) => d && setTempTime(d)}
                display={display}
                is24Hour={is24Hour}
                minuteInterval={minuteInterval}
                style={{ alignSelf: 'stretch' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  header: {
    paddingHorizontal: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontWeight: '700', fontSize: 16 },
  link: { color: '#2563EB', fontWeight: '600' },
});
