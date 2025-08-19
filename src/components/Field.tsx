import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
const Field = ({
  label,
  value,
  setter,
  rest,
}: {
  label: string;
  value: string;
  setter: (v: string) => void;
  rest: any;
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setter}
        style={styles.input}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  inputLabel: { marginBottom: 6, color: '#111827', fontWeight: '600' },
});

export default memo(Field);
