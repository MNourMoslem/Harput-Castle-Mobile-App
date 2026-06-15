import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

type ViewerComponent = React.ComponentType;

export default function ArScreen() {
  const [Viewer, setViewer] = useState<ViewerComponent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    import('@/components/ar/ViroCastleAr')
      .then((module) => {
        if (isMounted) {
          setViewer(() => module.default);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Failed to load the AR scene.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loadError) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>AR</Text>
        <Text style={styles.fallbackText}>{loadError}</Text>
      </View>
    );
  }

  if (!Viewer) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Preparing AR camera...</Text>
      </View>
    );
  }

  return <Viewer />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
