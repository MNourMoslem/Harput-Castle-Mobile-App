import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}

export default function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon = 'person-outline',
  autoCapitalize = 'none',
  keyboardType = 'default',
}: AuthTextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
