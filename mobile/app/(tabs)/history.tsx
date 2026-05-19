import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getHistoryList } from '@/services/history';
import { useLocale } from '@/services/i18n';
import HistoryCard from '@/components/history/HistoryCard';
import type { HistoryEntry } from '@/types/history';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

export default function HistoryScreen() {
  const { locale, t } = useLocale();

  const entries = useMemo(() => {
    try {
      return getHistoryList(locale);
    } catch {
      return [] as HistoryEntry[];
    }
  }, [locale]);

  function handlePress(entry: HistoryEntry) {
    router.push({ pathname: '/history/[slug]', params: { slug: entry.slug } });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Screen header ──────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t('history', 'screenTitle')}</Text>
      </View>

      {/* ── Chapter list ───────────────────────────── */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard entry={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('history', 'emptyState')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.base,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  listContent: {
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
