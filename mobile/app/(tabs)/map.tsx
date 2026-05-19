import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PlaceDetailOverlay from '../../components/place-detail/PlaceDetailOverlay';
import PlaceCard from '@/components/ui/PlaceCard';
import { resolveImage } from '@/constants/assets';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';
import { getPlacesMeta } from '@/services/places';
import type { PlaceMeta } from '@/types/place';

export default function MapScreen() {
  const { locale, t } = useLocale();
  const places = getPlacesMeta(locale);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleClose = () => setSelectedPlaceId(null);
  const selectedMeta: PlaceMeta | undefined = selectedPlaceId
    ? places.find((p) => p.id === selectedPlaceId)
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header banner ─────────────────────────────────────────────────── */}
        <ImageBackground
          source={resolveImage('media/Harput-kalesi.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15, 20, 8, 0.12)', 'rgba(15, 20, 8, 0.68)']}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            {/* Location pill */}
            <View style={styles.locationPill}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.locationPillText}>{t('map', 'regionLabel')}</Text>
            </View>
            <Text style={styles.headerTitle}>{t('map', 'historicSites')}</Text>
            <Text style={styles.headerSubtitle}>{`${places.length} ${t('map', 'locationsToExplore')}`}</Text>
          </View>
        </ImageBackground>

        {/* ── Place card list ───────────────────────────────────────────────── */}
        <View style={styles.listSection}>
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              meta={place}
              onPress={() => setSelectedPlaceId(place.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Place detail bottom sheets ──────────────────────────────────────── */}
      <PlaceDetailOverlay
        selectedPlaceId={selectedPlaceId}
        selectedMeta={selectedMeta}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xl,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerImage: {
    height: 230,
    justifyContent: 'flex-end',
  },
  headerContent: {
    padding: Layout.spacing.base,
    paddingBottom: Layout.spacing.lg,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: Layout.spacing.sm,
  },
  locationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listSection: {
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.base,
  },
});

