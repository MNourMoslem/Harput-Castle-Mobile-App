import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';

export default function LensScreen() {
  const { t } = useLocale();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.emoji}>📷</Text>
          <Text style={styles.label}>{`${t('common', 'appName')} ${t('common', 'navLens')}`}</Text>
        <Text style={styles.hint}>{t('common', 'screenInProgress')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  emoji: {
    fontSize: 56,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
