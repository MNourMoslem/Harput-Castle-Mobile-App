import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function ViroCastleAr() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.surface} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  surface: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});