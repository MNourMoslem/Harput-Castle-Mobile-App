import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthTextField from '@/components/auth/AuthTextField';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';
import { forgotPassword } from '@/services/auth';
import { ApiError } from '@/services/apiClient';

export default function ForgotPasswordScreen() {
  const { t } = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      setMessage(result.message);
      if (result.reset_token) {
        router.push({
          pathname: '/auth/reset-password',
          params: { token: result.reset_token },
        });
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title={t('auth', 'forgotTitle')}
      subtitle={t('auth', 'forgotSubtitle')}
    >
      <AuthTextField
        label={t('auth', 'email')}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        icon="mail-outline"
        keyboardType="email-address"
      />

      {message ? <Text style={styles.info}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading || !email}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.primaryBtnText}>{t('auth', 'sendReset')}</Text>
        )}
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  info: {
    color: Colors.primary,
    fontSize: 13,
    marginBottom: Layout.spacing.sm,
    lineHeight: 18,
  },
  error: {
    color: '#C0392B',
    fontSize: 13,
    marginBottom: Layout.spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
