import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import type { AuthUser } from '@/services/auth';
import { useLocale } from '@/services/i18n';

interface UserProfileModalProps {
  visible: boolean;
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function UserProfileModal({
  visible,
  user,
  onClose,
  onLogout,
}: UserProfileModalProps) {
  const insets = useSafeAreaInsets();
  const { t, locale } = useLocale();

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            {
              marginTop: Math.max(insets.top + Layout.spacing.xl, 72),
              marginBottom: Math.max(insets.bottom + Layout.spacing.lg, 40),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={Colors.primary} />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{user.username}</Text>
          <Text style={styles.subtitle}>{t('auth', 'account')}</Text>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{t('auth', 'email')}</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{t('auth', 'memberSince')}</Text>
                <Text style={styles.infoValue}>{formatDate(user.created_at, locale)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color="#C0392B" />
            <Text style={styles.logoutText}>{t('auth', 'logout')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 6, 0.48)',
    paddingHorizontal: Layout.spacing.base,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: Layout.spacing.lg,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoBlock: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#F0C4C4',
    backgroundColor: '#FFF5F5',
    borderRadius: Layout.radius.md,
    paddingVertical: 13,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C0392B',
  },
});
