import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/services/i18n';
import { askAssistant } from '@/services/assistantApi';
import { ApiError } from '@/services/apiClient';

const FAQ_KEYS = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'] as const;

export default function AssistantScreen() {
  const { t } = useLocale();
  const { isAuthenticated, requireAuth } = useAuth();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faqItems = useMemo(
    () => FAQ_KEYS.map((key) => ({ key, label: t('assistant', key) })),
    [t],
  );

  const sendQuestion = async (text: string) => {
    if (!requireAuth(t('assistant', 'loginHint'))) return;
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setQuestion(trimmed);
    setAnswer(null);
    setError(null);
    setLoading(true);

    try {
      const reply = await askAssistant(trimmed);
      setAnswer(reply);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.detail ?? e.message : t('assistant', 'errorGeneric'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary, '#3a5c2c']}
        style={styles.header}
      >
        <Ionicons name="sparkles" size={22} color={Colors.accent} />
        <Text style={styles.headerTitle}>{t('common', 'navAssistant')}</Text>
        <Text style={styles.headerSubtitle}>{t('assistant', 'subtitle')}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.faqTitle}>{t('assistant', 'faqTitle')}</Text>
        <View style={styles.faqList}>
          {faqItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.faqChip}
              onPress={() => sendQuestion(item.label)}
              disabled={loading}
            >
              <Text style={styles.faqChipText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder={t('assistant', 'placeholder')}
            placeholderTextColor={Colors.textSecondary}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!question.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendQuestion(question)}
            disabled={!question.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color={Colors.white} />
                <Text style={styles.sendBtnText}>{t('assistant', 'send')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {!isAuthenticated ? (
          <Text style={styles.loginHint}>{t('assistant', 'loginHint')}</Text>
        ) : null}

        {loading ? (
          <View style={styles.answerCard}>
            <Text style={styles.thinking}>{t('assistant', 'thinking')}</Text>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>{t('common', 'navAssistant')}</Text>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        ) : null}
      </ScrollView>
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
    paddingBottom: Layout.spacing.lg,
    borderBottomLeftRadius: Layout.radius.lg,
    borderBottomRightRadius: Layout.radius.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight,
    marginTop: Layout.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(250,248,245,0.82)',
    marginTop: 6,
    lineHeight: 20,
  },
  content: {
    padding: Layout.spacing.base,
    paddingBottom: Layout.spacing.xl,
  },
  faqTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Layout.spacing.sm,
  },
  faqList: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  faqChip: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 12,
  },
  faqChipText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  input: {
    minHeight: 88,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: Layout.spacing.md,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.md,
    paddingVertical: 12,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  loginHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  answerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  answerText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  thinking: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  error: {
    color: '#C0392B',
    fontSize: 13,
    marginTop: Layout.spacing.sm,
  },
});
