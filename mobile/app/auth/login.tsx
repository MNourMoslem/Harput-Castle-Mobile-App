import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';

import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthTextField from '@/components/auth/AuthTextField';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/services/i18n';
import { ApiError } from '@/services/apiClient';

export default function LoginScreen() {
  const { t } = useLocale();
  const { login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ message?: string }>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username.trim() || !password) {
      setError(t('auth', 'loginFieldsRequired'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title={t('auth', 'loginTitle')}
      subtitle={params.message ?? t('auth', 'loginSubtitle')}
      footer={
        <Text style={styles.footerText}>
          {t('auth', 'noAccount')}{' '}
          <Link href="/auth/register" style={styles.link}>
            {t('auth', 'signUp')}
          </Link>
        </Text>
      }
    >
      <AuthTextField
        label={t('auth', 'username')}
        value={username}
        onChangeText={setUsername}
        placeholder={t('auth', 'usernamePlaceholder')}
        icon="person-outline"
      />
      <AuthTextField
        label={t('auth', 'password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        icon="lock-closed-outline"
      />

      <Link href="/auth/forgot-password" style={styles.forgotLink}>
        {t('auth', 'forgotPassword')}
      </Link>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          (loading || pressed) && styles.primaryBtnPressed,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.primaryBtnText}>{t('auth', 'login')}</Text>
        )}
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: Layout.spacing.md,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
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
  primaryBtnPressed: { opacity: 0.85 },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
