import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LanguageModal from '../../components/ui/LanguageModal';
import { resolveImage } from '@/constants/assets';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';
import { getTotalPlaces } from '@/services/places';
import { useUserPrefs } from '@/contexts/UserPrefsContext';

export default function HomeScreen() {
  const { t, locale } = useLocale();
  const insets = useSafeAreaInsets();
  const { getVisitedCount } = useUserPrefs();
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const totalCount = getTotalPlaces();
  const visitedCount = getVisitedCount();

  // ── Animation refs ──────────────────────────────────────────────────────────
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const welcomeSlide = useRef(new Animated.Value(40)).current;
  const progressFade = useRef(new Animated.Value(0)).current;
  const progressSlide = useRef(new Animated.Value(-18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(welcomeFade, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(welcomeSlide, {
        toValue: 0,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressFade, {
        toValue: 1,
        duration: 700,
        delay: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(progressSlide, {
        toValue: 0,
        duration: 700,
        delay: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={resolveImage('media/harput-genel.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          'rgba(20, 10, 3, 0.08)',
          'rgba(20, 10, 3, 0.30)',
          'rgba(20, 10, 3, 0.84)',
        ]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Layout.spacing.md,
            paddingBottom: insets.bottom + Layout.spacing.sm,
          },
        ]}
      >
        {/* ── Top progress row ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.progressRow,
            {
              opacity: progressFade,
              transform: [{ translateY: progressSlide }],
            },
          ]}
        >
          <View>
            <Text style={styles.progressLabel}>{t('home', 'progressTitle')}</Text>
            <View style={styles.progressCountWrapper}>
              <Text style={styles.progressCurrent}>{visitedCount}</Text>
              <Text style={styles.progressSeparator}> / </Text>
              <Text style={styles.progressTotal}>{totalCount}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="language-outline" size={18} color={Colors.textLight} />
            <Text style={styles.languageButtonText}>
              {locale === 'en' ? t('common', 'langEn') : t('common', 'langTr')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <LanguageModal
          visible={isLanguageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
        />

        <View style={styles.spacer} />

        {/* ── Welcome section ───────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: welcomeFade,
              transform: [{ translateY: welcomeSlide }],
            },
          ]}
        >
          <Text style={styles.appName}>{t('home', 'welcomeTitle')}</Text>
          <Text style={styles.subtitle}>{t('home', 'welcomeSubtitle')}</Text>
          <View style={styles.divider} />
          <Text style={styles.welcomeSentence}>
            {t('home', 'welcomeSentence')}
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Layout.spacing.base,
  },

  // ── Progress row ─────────────────────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.75,
  },
  progressCountWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  progressCurrent: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  progressSeparator: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(250, 248, 245, 0.5)',
  },
  progressTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(250, 248, 245, 0.6)',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 248, 245, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(250, 248, 245, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  languageButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.6,
  },

  spacer: {
    flex: 1,
  },

  // ── Welcome section ──────────────────────────────────────────────────────────
  welcomeSection: {
    alignItems: 'center',
    paddingBottom: Layout.spacing.md,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textLight,
    textAlign: 'center',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: Layout.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  divider: {
    width: 56,
    height: 1,
    backgroundColor: Colors.accent,
    marginVertical: Layout.spacing.md,
    opacity: 0.72,
  },
  welcomeSentence: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 22,
    maxWidth: 290,
    opacity: 0.88,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
