import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

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
        <Text style={styles.label}>{t('common', 'navGallery')}</Text>
      </View>

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

      <Modal
        animationType="fade"
        presentationStyle="fullScreen"
        visible={selectedImageIndex !== null}
        onRequestClose={() => setSelectedImageIndex(null)}
      >
        <View style={styles.modalRoot}>
          <FlatList
            ref={viewerListRef}
            data={images}
            horizontal
            pagingEnabled
            bounces={false}
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
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.sm,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  viewerSlide: {
    height: '100%',
  },
});
