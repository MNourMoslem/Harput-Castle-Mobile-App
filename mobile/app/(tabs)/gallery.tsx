import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import GalleryGrid from '@/components/gallery/GalleryGrid';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { usePaginatedGallery } from '@/hooks/usePaginatedGallery';
import { useLocale } from '@/services/i18n';
import type { GalleryImageItem } from '@/types/gallery';

export default function GalleryScreen() {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const viewerListRef = useRef<FlatList<GalleryImageItem> | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const {
    images,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    loadNextPage,
    refresh,
  } = usePaginatedGallery();

  const galleryCountLabel = useMemo(
    () => `${images.length} ${t('common', 'galleryCountLabel')}`,
    [images.length, t],
  );

  const openViewer = useCallback(
    (item: GalleryImageItem) => {
      const nextIndex = images.findIndex((image) => image.id === item.id);
      if (nextIndex >= 0) {
        setSelectedImageIndex(nextIndex);
      }
    },
    [images],
  );

  const handleRefresh = useCallback(async () => {
    setSelectedImageIndex(null);
    await refresh();
  }, [refresh]);

  const handleViewerMomentumEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      if (nextIndex >= 0 && nextIndex < images.length) {
        setSelectedImageIndex(nextIndex);
      }
    },
    [images.length, width],
  );

  useEffect(() => {
    if (selectedImageIndex === null || !viewerListRef.current) {
      return;
    }
    viewerListRef.current.scrollToIndex({ index: selectedImageIndex, animated: false });
  }, [selectedImageIndex]);

  const renderViewerItem = useCallback(
    ({ item }: { item: GalleryImageItem }) => (
      <View style={[styles.viewerSlide, { width }]}>
        <Image
          source={item.source}
          cachePolicy="memory-disk"
          contentFit="contain"
          style={styles.modalImage}
          transition={220}
        />
      </View>
    ),
    [width],
  );

  const getViewerItemLayout = useCallback(
    (_: ArrayLike<GalleryImageItem> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{t('common', 'navGallery')}</Text>
          <Text style={styles.hint}>{t('common', 'galleryHint')}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeEyebrow}>{t('common', 'galleryMockBadge')}</Text>
          <Text style={styles.badgeValue}>{galleryCountLabel}</Text>
        </View>
      </View>

      {images.length === 0 && !isInitialLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('common', 'galleryEmpty')}</Text>
        </View>
      ) : (
        <GalleryGrid
          images={images}
          isInitialLoading={isInitialLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          isRefreshing={isRefreshing}
          onEndReached={loadNextPage}
          onRefresh={handleRefresh}
          onPressImage={openViewer}
        />
      )}

      <Modal
        animationType="fade"
        transparent
        visible={selectedImageIndex !== null}
        onRequestClose={() => setSelectedImageIndex(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedImageIndex(null)}
          />

          <View style={styles.modalCard}>
            <Pressable
              accessibilityLabel={t('common', 'galleryViewerClose')}
              accessibilityRole="button"
              onPress={() => setSelectedImageIndex(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </Pressable>

            <View style={styles.modalMeta}>
              <Text style={styles.modalHint}>{t('common', 'galleryViewerHint')}</Text>
              {selectedImageIndex !== null && (
                <Text style={styles.modalCount}>{selectedImageIndex + 1} / {images.length}</Text>
              )}
            </View>

            <FlatList
              ref={viewerListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              initialScrollIndex={selectedImageIndex ?? 0}
              getItemLayout={getViewerItemLayout}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 50));
                wait.then(() => {
                  viewerListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: false,
                  });
                });
              }}
              onMomentumScrollEnd={handleViewerMomentumEnd}
              renderItem={renderViewerItem}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.base,
    gap: Layout.spacing.base,
  },
  badge: {
    minWidth: 110,
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
    maxWidth: 220,
    lineHeight: 18,
  },
  badgeEyebrow: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgeValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.base,
    paddingVertical: Layout.spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 760,
    height: '100%',
    maxHeight: 760,
    borderRadius: Layout.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#10150d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalMeta: {
    position: 'absolute',
    left: Layout.spacing.base,
    right: 68,
    top: Layout.spacing.base,
    zIndex: 1,
  },
  modalHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  modalCount: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: Layout.spacing.base,
    right: Layout.spacing.base,
    zIndex: 1,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  viewerSlide: {
    height: '100%',
    paddingHorizontal: Layout.spacing.base,
    paddingTop: 56,
    paddingBottom: Layout.spacing.base,
  },
});
