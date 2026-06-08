import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import GalleryGrid from '@/components/gallery/GalleryGrid';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedGallery } from '@/hooks/usePaginatedGallery';
import { useLocale } from '@/services/i18n';
import { deleteGalleryImage, uploadGalleryImage } from '@/services/galleryApi';
import { ApiError } from '@/services/apiClient';
import type { GalleryImageItem } from '@/types/gallery';

export default function GalleryScreen() {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const { user, requireAuth } = useAuth();
  const viewerListRef = useRef<FlatList<GalleryImageItem> | null>(null);

  const [mineOnly, setMineOnly] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    images,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    loadNextPage,
    refresh,
  } = usePaginatedGallery({ mineOnly, currentUserId: user?.id ?? null });

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

  const handleUpload = useCallback(async () => {
    if (!requireAuth(t('common', 'galleryUploadAuth'))) return;

    const ImagePicker = await import('expo-image-picker');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await uploadGalleryImage(
        asset.uri,
        asset.fileName ?? 'photo.jpg',
        asset.mimeType ?? 'image/jpeg',
      );
      await refresh();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric');
      Alert.alert(t('common', 'galleryUpload'), message);
    } finally {
      setUploading(false);
    }
  }, [requireAuth, refresh, t]);

  const handleDelete = useCallback(
    (item: GalleryImageItem) => {
      Alert.alert(t('common', 'galleryDelete'), t('common', 'galleryDeleteConfirm'), [
        { text: t('common', 'close'), style: 'cancel' },
        {
          text: t('common', 'galleryDelete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGalleryImage(item.id);
              setSelectedImageIndex(null);
              await refresh();
            } catch (e) {
              const message =
                e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric');
              Alert.alert(t('common', 'galleryDelete'), message);
            }
          },
        },
      ]);
    },
    [refresh, t],
  );

  const handleViewerMomentumEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      if (nextIndex >= 0 && nextIndex < images.length) {
        setSelectedImageIndex(nextIndex);
      }
    },
    [images.length, width],
  );

  React.useEffect(() => {
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

  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{t('common', 'navGallery')}</Text>
        <View style={styles.headerActions}>
          <View style={styles.mineToggle}>
            <Text style={styles.mineLabel}>{t('common', 'galleryMineOnly')}</Text>
            <Switch
              value={mineOnly}
              onValueChange={(value) => {
                if (value && !requireAuth(t('common', 'galleryUploadAuth'))) return;
                setMineOnly(value);
              }}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
                <Text style={styles.uploadBtnText}>{t('common', 'galleryUpload')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
          <View style={styles.modalTopBar}>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setSelectedImageIndex(null)}
            >
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
            {selectedImage?.isOwn ? (
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => handleDelete(selectedImage)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF8A8A" />
              </TouchableOpacity>
            ) : (
              <View style={styles.modalBtnPlaceholder} />
            )}
          </View>

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
    paddingBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  mineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  mineLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalTopBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.base,
  },
  modalBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPlaceholder: {
    width: 42,
    height: 42,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  viewerSlide: {
    height: '100%',
  },
});
