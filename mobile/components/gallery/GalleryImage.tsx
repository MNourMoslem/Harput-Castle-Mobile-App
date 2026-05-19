import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import type { GalleryImageItem } from '@/types/gallery';

interface GalleryImageProps {
  item: GalleryImageItem;
  size: number;
  onPress: (item: GalleryImageItem) => void;
}

export default function GalleryImage({ item, size, onPress }: GalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (isLoaded) {
      pulse.stopAnimation();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isLoaded, pulse]);

  const imageStyle = useMemo(
    () => [styles.image, { width: size, height: size }],
    [size],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.pressable,
        { width: size, height: size, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <Image
        source={item.thumbnailSource}
        cachePolicy="memory-disk"
        contentFit="cover"
        style={imageStyle}
        transition={180}
        onLoadEnd={() => setIsLoaded(true)}
      />

      {!isLoaded && (
        <Animated.View
          pointerEvents="none"
          style={[styles.skeleton, { opacity: pulse, width: size, height: size }]}
        />
      )}

      <View pointerEvents="none" style={styles.frame} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  image: {
    backgroundColor: Colors.border,
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#d7e1c8',
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
});