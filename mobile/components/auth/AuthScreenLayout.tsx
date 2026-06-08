import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primary, '#3d5f2e', Colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + Layout.spacing.md, paddingBottom: insets.bottom + 48 },
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.card}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Layout.spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Layout.spacing.sm,
    fontSize: 14,
    color: 'rgba(250,248,245,0.82)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  footer: {
    marginTop: Layout.spacing.lg,
    alignItems: 'center',
  },
});
