import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { resolveImage } from '@/constants/assets';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { PlaceMeta } from '@/types/place';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import Badge from '@/components/ui/Badge';
import { usePlacePrefs, useUserPrefs } from '@/contexts/UserPrefsContext';
import { useLocale } from '@/services/i18n';
import { getPlaceCategoryLabel } from '@/services/placeCategory';

// Image resolution is now handled by constants/assets.ts

// ── Category icon map (all outlined) ─────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  tower: 'telescope-outline',
  gate: 'trail-sign-outline',
  mosque: 'moon-outline',
  church: 'prism-outline',
  cistern: 'water-outline',
  viewpoint: 'eye-outline',
  ruins: 'layers-outline',
  palace: 'business-outline',
  cemetery: 'leaf-outline',
  archaeological: 'search-outline',
};

interface PlaceCardProps {
  meta: PlaceMeta;
  onPress?: () => void;
}

function PlaceCard({ meta, onPress }: PlaceCardProps) {
  const userData = usePlacePrefs(meta.id);
  const { toggleFavorite } = useUserPrefs();
  const { t } = useLocale();
  const categoryIcon = CATEGORY_ICONS[meta.category] ?? 'location-outline';
  const categoryLabel = getPlaceCategoryLabel(meta.category, t);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* ── Image section ─────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={resolveImage(meta.imageAsset)}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {/* Bottom gradient for text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.68)']}
          locations={[0.28, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Distance badge — top left */}
        <View style={styles.distanceBadge}>
          <Ionicons name="walk-outline" size={11} color={Colors.primary} />
          <Text style={styles.distanceText}>{meta.distance}</Text>
        </View>

        {/* Favourite button — top right */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleFavorite(meta.id)}
          style={styles.favouriteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={userData.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={userData.isFavorite ? '#E05252' : Colors.white}
          />
        </TouchableOpacity>

        {/* Title + rating pinned to image bottom */}
        <View style={styles.imageFooter}>
          <Text style={styles.placeName} numberOfLines={1}>
            {meta.name}
          </Text>
          {meta.rating != null && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color={Colors.accent} />
              <Text style={styles.ratingText}>{meta.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Card footer ───────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color={Colors.textSecondary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {meta.locationLabel}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          {userData.visited && (
            <Badge
              label={t('place', 'visitedDone')}
              variant="visited"
              icon="checkmark-circle"
            />
          )}
          <Badge
            label={categoryLabel}
            variant="category"
            icon={categoryIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    overflow: 'hidden',
    marginBottom: Layout.spacing.base,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: Layout.spacing.md,
    left: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 5,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  favouriteBtn: {
    position: 'absolute',
    top: Layout.spacing.md,
    right: Layout.spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  imageFooter: {
    position: 'absolute',
    bottom: Layout.spacing.md,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginRight: Layout.spacing.sm,
    letterSpacing: 0.2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  locationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
});

export default React.memo(PlaceCard);
