import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface SimpleInfoScreenProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function SimpleInfoScreen({
  title,
  subtitle,
  icon = 'construct-outline',
}: SimpleInfoScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8eedc',
    marginBottom: Layout.spacing.base,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: Layout.spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 320,
  },
});
