import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthTextField from '@/components/auth/AuthTextField';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';
import { resetPassword } from '@/services/auth';
import { ApiError } from '@/services/apiClient';

export default function ResetPasswordScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password !== confirm) {
      setError(t('auth', 'passwordMismatch'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      router.replace('/auth/login');
    } catch (e) {
      setError(e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title={t('auth', 'resetTitle')}
      subtitle={t('auth', 'resetSubtitle')}
    >
      <AuthTextField
        label={t('auth', 'resetToken')}
        value={token}
        onChangeText={setToken}
        placeholder={t('auth', 'resetTokenPlaceholder')}
        icon="key-outline"
      />
      <AuthTextField
        label={t('auth', 'newPassword')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth', 'passwordHint')}
        secureTextEntry
        icon="lock-closed-outline"
      />
      <AuthTextField
        label={t('auth', 'confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        secureTextEntry
        icon="lock-closed-outline"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
        onPress={handleReset}
        disabled={loading || !token || password.length < 8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.primaryBtnText}>{t('auth', 'resetPassword')}</Text>
        )}
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
