import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHistoryEntry } from '@/services/history';
import { useLocale } from '@/services/i18n';
import HistoryDetailView from '@/components/history/HistoryDetailView';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

export default function HistoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();

  const entry = useMemo(() => {
    try {
      return getHistoryEntry(slug ?? '', locale);
    } catch {
      return null;
    }
  }, [slug, locale]);

  if (!entry) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{t('history', 'emptyState')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Hero header ──────────────────────────────────── */}
      <View style={styles.hero}>
        <Image
          source={{ uri: entry.imageAsset }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + Layout.spacing.sm }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back-outline" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Period badge + title at bottom of hero */}
        <View style={styles.heroMeta}>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>{entry.period}</Text>
          </View>
          <Text style={styles.heroTitle}>{entry.title}</Text>
        </View>
      </View>

      {/* ── Scrollable body ──────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Layout.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HistoryDetailView sections={entry.sections} />

        {/* Wikimedia attribution footer */}
        <View style={styles.attribution}>
          <Ionicons
            name="information-circle-outline"
            size={13}
            color={Colors.textSecondary}
          />
          <Text style={styles.attributionText}>
            {t('history', 'imageAttribution')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: 250,
    justifyContent: 'flex-end',
  },
  backBtn: {
    position: 'absolute',
    left: Layout.spacing.base,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMeta: {
    padding: Layout.spacing.base,
    gap: Layout.spacing.xs,
  },
  periodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    borderRadius: Layout.radius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 3,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 28,
  },
  scrollContent: {
    paddingTop: Layout.spacing.base,
  },
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  attributionText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
