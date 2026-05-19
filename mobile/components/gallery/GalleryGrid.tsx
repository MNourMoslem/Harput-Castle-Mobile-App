import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import type { GalleryImageItem } from '@/types/gallery';
import GalleryImage from '@/components/gallery/GalleryImage';

const GRID_COLUMNS = 3;
const GRID_GAP = Layout.spacing.sm;
const SCREEN_PADDING = Layout.spacing.base;

interface GalleryGridProps {
  images: GalleryImageItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isRefreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onPressImage: (item: GalleryImageItem) => void;
}

function SkeletonTile({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.95,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <Animated.View
      style={[styles.skeletonTile, { width: size, height: size, opacity: pulse }]}
    />
  );
}

export default function GalleryGrid({
  images,
  isInitialLoading,
  isLoadingMore,
  hasMore,
  isRefreshing,
  onEndReached,
  onRefresh,
  onPressImage,
}: GalleryGridProps) {
  const { width } = useWindowDimensions();

  const tileSize = useMemo(() => {
    const availableWidth = width - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor(availableWidth / GRID_COLUMNS);
  }, [width]);

  const skeletonItems = useMemo(
    () => Array.from({ length: 9 }, (_, index) => `gallery-skeleton-${index}`),
    [],
  );
  const footerSkeletonItems = useMemo(
    () => Array.from({ length: GRID_COLUMNS }, (_, index) => `gallery-footer-skeleton-${index}`),
    [],
  );

  if (isInitialLoading && images.length === 0) {
    return (
      <View style={styles.grid}>
        {skeletonItems.map((item) => (
          <SkeletonTile key={item} size={tileSize} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <GalleryImage item={item} size={tileSize} onPress={onPressImage} />
      )}
      onEndReachedThreshold={0.45}
      onEndReached={() => {
        if (!isLoadingMore && hasMore) {
          onEndReached();
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
          progressBackgroundColor={Colors.surface}
        />
      }
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerSkeletonRow}>
            {footerSkeletonItems.map((item) => (
              <SkeletonTile key={item} size={tileSize} />
            ))}
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Layout.spacing.xl,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Layout.spacing.xl,
  },
  skeletonTile: {
    borderRadius: Layout.radius.md,
    backgroundColor: '#d7e1c8',
  },
  footerSkeletonRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
    paddingTop: Layout.spacing.xs,
  },
});