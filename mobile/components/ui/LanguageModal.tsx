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
import { type SupportedLocale, useLocale } from '@/services/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGE_OPTIONS: Array<{
  code: SupportedLocale;
  labelKey: 'langEn' | 'langTr';
  nativeLabel: string;
}> = [
  { code: 'en', labelKey: 'langEn', nativeLabel: 'English' },
  { code: 'tr', labelKey: 'langTr', nativeLabel: 'Turkce' },
];

export default function LanguageModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { locale, setLocale, t } = useLocale();

  const handleSelect = async (nextLocale: SupportedLocale) => {
    if (nextLocale !== locale) {
      await setLocale(nextLocale);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
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
            <View>
              <Text style={styles.title}>{t('common', 'languageTitle')}</Text>
              <Text style={styles.subtitle}>{t('common', 'languageSelect')}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {LANGUAGE_OPTIONS.map((option) => {
              const isActive = option.code === locale;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => void handleSelect(option.code)}
                  activeOpacity={0.85}
                >
                  <View>
                    <Text style={[styles.optionTitle, isActive && styles.optionTitleActive]}>
                      {t('common', option.labelKey)}
                    </Text>
                    <Text style={[styles.optionSubtitle, isActive && styles.optionSubtitleActive]}>
                      {option.nativeLabel}
                    </Text>
                  </View>
                  <View style={[styles.checkWrap, isActive && styles.checkWrapActive]}>
                    <Ionicons
                      name={isActive ? 'checkmark-outline' : 'ellipse-outline'}
                      size={20}
                      color={isActive ? Colors.white : Colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    padding: Layout.spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Layout.spacing.base,
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
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
  options: {
    gap: Layout.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.spacing.base,
    paddingHorizontal: Layout.spacing.base,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optionTitleActive: {
    color: Colors.white,
  },
  optionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  optionSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.78)',
  },
  checkWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkWrapActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
});
