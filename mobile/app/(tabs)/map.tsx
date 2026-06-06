import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
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
  const places = useMemo(() => getPlacesMeta(locale), [locale]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleClose = useCallback(() => setSelectedPlaceId(null), []);
  const selectedMeta: PlaceMeta | undefined = selectedPlaceId
    ? places.find((p) => p.id === selectedPlaceId)
    : undefined;

  const headerImage = useMemo(() => resolveImage('media/Harput-kalesi.jpg'), []);

  const ListHeader = useMemo(
    () => (
      <ImageBackground
        source={headerImage}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 20, 8, 0.12)', 'rgba(15, 20, 8, 0.68)']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View style={styles.locationPill}>
            <Ionicons name="location" size={12} color={Colors.primary} />
            <Text style={styles.locationPillText}>{t('map', 'regionLabel')}</Text>
          </View>
          <Text style={styles.headerTitle}>{t('map', 'historicSites')}</Text>
          <Text style={styles.headerSubtitle}>{`${places.length} ${t('map', 'locationsToExplore')}`}</Text>
        </View>
      </ImageBackground>
    ),
    [headerImage, places.length, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: PlaceMeta }) => (
      <PlaceCard meta={item} onPress={() => setSelectedPlaceId(item.id)} />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />

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
  listContent: {
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.base,
    paddingBottom: Layout.spacing.xl,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerImage: {
    height: 230,
    justifyContent: 'flex-end',
    marginHorizontal: -Layout.spacing.base,
    marginBottom: Layout.spacing.base,
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
});

