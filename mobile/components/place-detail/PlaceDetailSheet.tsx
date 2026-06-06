/**
 * PlaceDetailSheet — Component 2 (shared wrapper)
 *
 * Wraps BottomSheet and provides all shared functionality:
 *   • Favourite toggle
 *   • Visited toggle
 *   • Star rating + note (persisted to AsyncStorage)
 *   • In-app location map (react-native-maps)
 *
 * Place-specific content is injected via `children`.
 *
 * NOTE for Android: react-native-maps requires a Google Maps API key.
 * Add it to app.json → android.config.googleMaps.apiKey for production builds.
 * Expo Go shows a development watermark without the key.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet from '@/components/ui/BottomSheet';
import InfoChip from '@/components/ui/InfoChip';
import SectionCard from '@/components/ui/SectionCard';
import type { PlaceMeta } from '@/types/place';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { usePlacePrefs, useUserPrefs } from '@/contexts/UserPrefsContext';
import { useLocale } from '@/services/i18n';
import { getPlaceCategoryLabel } from '@/services/placeCategory';

import { resolveImage } from '@/constants/assets';

// ── Shared sub-components ─────────────────────────────────────────────────────

export { default as SectionCard } from '@/components/ui/SectionCard';

/** Reusable stat item for 2-column grids in place-specific content */
export function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}) {
  return <InfoChip icon={icon} value={value} label={label} variant="stat" />;
}

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={30}
            color={star <= value ? Colors.accent : Colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PlaceDetailSheetProps {
  meta: PlaceMeta;
  visible: boolean;
  onClose: () => void;
  /** Place-specific content rendered below the shared sections */
  children?: React.ReactNode;
}

export default function PlaceDetailSheet({
  meta,
  visible,
  onClose,
  children,
}: PlaceDetailSheetProps) {
  // All persistent user data comes from context — no local AsyncStorage calls
  const userData = usePlacePrefs(meta.id);
  const { toggleFavorite: ctxToggleFav, toggleVisited: ctxToggleVisited, setRating, saveNote: ctxSaveNote } = useUserPrefs();

  const { t, locale } = useLocale();
  const ratingLabels = ['', t('place', 'ratingPoor'), t('place', 'ratingFair'), t('place', 'ratingGood'), t('place', 'ratingGreat'), t('place', 'ratingExcellent')];
  const categoryLabel = getPlaceCategoryLabel(meta.category, t);

  // Only note input is local (controlled input state)
  const [noteInput, setNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Sync note textarea when sheet opens or userData.note changes from context
  useEffect(() => {
    if (visible) {
      setNoteInput(userData.note);
      setNoteSaved(false);
    }
  }, [visible, userData.note]);

  const toggleFavorite = useCallback(
    () => ctxToggleFav(meta.id),
    [ctxToggleFav, meta.id],
  );

  const toggleVisited = useCallback(
    () => ctxToggleVisited(meta.id),
    [ctxToggleVisited, meta.id],
  );

  const handleRating = useCallback(
    (rating: number) => setRating(meta.id, rating),
    [setRating, meta.id],
  );

  const handleSaveNote = useCallback(() => {
    ctxSaveNote(meta.id, noteInput);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2200);
  }, [ctxSaveNote, meta.id, noteInput]);

  const imageSource = resolveImage(meta.imageAsset);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <View style={styles.hero}>
            <Image
              source={imageSource}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              locations={[0.25, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.white} />
            </TouchableOpacity>

            {/* Category pill */}
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{categoryLabel}</Text>
            </View>

            {/* Bottom overlay: title + meta */}
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {meta.name}
              </Text>
              <View style={styles.heroMeta}>
                {meta.rating != null && (
                  <>
                    <Ionicons name="star" size={13} color={Colors.accent} />
                    <Text style={styles.heroMetaText}>{meta.rating.toFixed(1)}</Text>
                    <Text style={styles.heroMetaDot}>·</Text>
                  </>
                )}
                <Ionicons
                  name="walk-outline"
                  size={13}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.heroMetaText}>{meta.distance}</Text>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaText}>{meta.locationLabel}</Text>
              </View>
            </View>
          </View>

          {/* Short description */}
          <Text style={styles.shortDesc}>{meta.shortDescription}</Text>

          {/* ── Action row: Favourite + Visited ───────────────────────────── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                userData.isFavorite && styles.actionBtnFav,
              ]}
              onPress={toggleFavorite}
              activeOpacity={0.8}
            >
              <Ionicons
                name={userData.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={userData.isFavorite ? '#E05252' : Colors.primary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  userData.isFavorite && styles.actionBtnTextFav,
                ]}
              >
                {userData.isFavorite ? t('place', 'saved') : t('place', 'favourite')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                userData.visited && styles.actionBtnVisited,
              ]}
              onPress={toggleVisited}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  userData.visited
                    ? 'checkmark-circle'
                    : 'radio-button-off-outline'
                }
                size={20}
                color={userData.visited ? Colors.visited : Colors.primary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  userData.visited && styles.actionBtnTextVisited,
                ]}
              >
                {userData.visited ? t('place', 'visitedDone') : t('place', 'markVisited')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Place-specific content ─────────────────────────────────────── */}
          {children}

          {/* ── Your Rating ───────────────────────────────────────────────── */}
          <SectionCard title={t('place', 'sectionRating')}>
            <StarRow value={userData.rating} onChange={handleRating} />
            {userData.rating > 0 && (
              <Text style={styles.ratingLabel}>
                {ratingLabels[userData.rating]}
              </Text>
            )}
            <TextInput
              style={styles.noteInput}
              placeholder={t('place', 'notePlaceholder')}
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              value={noteInput}
              onChangeText={setNoteInput}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, noteSaved && styles.saveBtnDone]}
              onPress={handleSaveNote}
              activeOpacity={0.85}
            >
              <Ionicons
                name={noteSaved ? 'checkmark' : 'save-outline'}
                size={16}
                color={Colors.white}
              />
              <Text style={styles.saveBtnText}>
                {noteSaved ? t('place', 'savedReview') : t('place', 'saveReview')}
              </Text>
            </TouchableOpacity>
          </SectionCard>

          {/* ── Location map ──────────────────────────────────────────────── */}
          <SectionCard title={t('place', 'sectionLocation')}>
            <View style={styles.mapWrapper}>
              {(meta.coordinate || meta.coordinates) ? (
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={styles.mapView}
                  initialRegion={{
                    latitude: meta.coordinate?.latitude ?? meta.coordinates?.lat ?? 38.705,
                    longitude: meta.coordinate?.longitude ?? meta.coordinates?.lng ?? 39.255,
                    latitudeDelta: 0.004,
                    longitudeDelta: 0.004,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: meta.coordinate?.latitude ?? meta.coordinates?.lat ?? 38.705,
                      longitude: meta.coordinate?.longitude ?? meta.coordinates?.lng ?? 39.255,
                    }}
                    title={meta.name}
                    description={meta.locationLabel}
                  />
                </MapView>
              ) : (
                <View style={[styles.mapView, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: Colors.textSecondary }}>Harita bilgisi bulunamadı.</Text>
                </View>
              )}
            </View>
            <View style={styles.mapFooter}>
              <Ionicons
                name="location-outline"
                size={13}
                color={Colors.textSecondary}
              />
              <Text style={styles.mapAddress}>{meta.locationLabel}</Text>
            </View>
          </SectionCard>

        </ScrollView>
      </KeyboardAvoidingView>

    </BottomSheet>
  );
}

// ── Style sheets ──────────────────────────────────────────────────────────────

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Hero
  hero: { height: 220, marginBottom: Layout.spacing.sm },
  closeBtn: {
    position: 'absolute',
    top: Layout.spacing.md,
    right: Layout.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: Layout.spacing.md,
    left: Layout.spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  heroBottom: {
    position: 'absolute',
    bottom: Layout.spacing.md,
    left: Layout.spacing.base,
    right: Layout.spacing.base,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
    marginBottom: 5,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  heroMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
  },
  heroMetaDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },

  // Short description
  shortDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginHorizontal: Layout.spacing.base,
    marginBottom: Layout.spacing.base,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginHorizontal: Layout.spacing.base,
    marginBottom: Layout.spacing.base,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  actionBtnFav: {
    borderColor: '#E05252',
    backgroundColor: '#FFF5F5',
  },
  actionBtnVisited: {
    borderColor: Colors.visited,
    backgroundColor: '#F0FAF0',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionBtnTextFav: { color: '#E05252' },
  actionBtnTextVisited: { color: Colors.visited },

  // Rating
  ratingLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 2,
  },
  noteInput: {
    marginTop: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    padding: Layout.spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Layout.spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.sm,
    paddingVertical: 11,
  },
  saveBtnDone: { backgroundColor: Colors.visited },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Map
  mapWrapper: {
    aspectRatio: 16 / 9,
    borderRadius: Layout.radius.sm,
    overflow: 'hidden',
  },
  mapView: { flex: 1 },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Layout.spacing.sm,
  },
  mapAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },

});
