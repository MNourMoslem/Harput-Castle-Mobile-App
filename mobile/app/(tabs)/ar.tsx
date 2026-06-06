import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

type ViewerComponent = React.ComponentType;

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

function ExpoGoFallback() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>AR</Text>
      <Text style={styles.fallbackText}>
        ViroReact needs a development build. Expo Go cannot load the native AR
        scene.
      </Text>
    </View>
  );
}

export default function ArScreen() {
  const [Viewer, setViewer] = useState<ViewerComponent | null>(null);

  useEffect(() => {
    if (isExpoGo) {
      return;
    }

    let isMounted = true;

    import('@/components/ar/ViroCastleAr').then((module) => {
      if (isMounted) {
        setViewer(() => module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isExpoGo) {
    return <ExpoGoFallback />;
  }

  if (!Viewer) {
    return <View style={styles.loading} />;
  }

  return <Viewer />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
    backgroundColor: Colors.background,
  },
  fallbackTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.sm,
  },
  fallbackText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 320,
  },
});
