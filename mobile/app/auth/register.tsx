import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthTextField from '@/components/auth/AuthTextField';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/services/i18n';
import { ApiError } from '@/services/apiClient';

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

function getValidationError(
  username: string,
  email: string,
  password: string,
  t: (ns: 'auth', key: string) => string,
): string | null {
  if (!username.trim()) return t('auth', 'usernameRequired');
  if (username.trim().length < 3) return t('auth', 'usernameTooShort');
  if (!USERNAME_RE.test(username.trim())) return t('auth', 'usernameInvalid');
  if (!email.trim()) return t('auth', 'emailRequired');
  if (!email.includes('@')) return t('auth', 'emailInvalid');
  if (password.length < 8) return t('auth', 'passwordTooShort');
  return null;
}

export default function RegisterScreen() {
  const { t } = useLocale();
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validationError = useMemo(
    () => getValidationError(username, email, password, t),
    [username, email, password, t],
  );

  const handleRegister = async () => {
    Keyboard.dismiss();
    const localError = getValidationError(username, email, password, t);
    if (localError) {
      setError(localError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail ?? e.message : t('auth', 'errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
        title={t('auth', 'registerTitle')}
        subtitle={t('auth', 'registerSubtitle')}
        footer={
          <Text style={styles.footerText}>
            {t('auth', 'hasAccount')}{' '}
            <Link href="/auth/login" style={styles.link}>
              {t('auth', 'login')}
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
        <Text style={styles.hint}>{t('auth', 'usernameRules')}</Text>

        <AuthTextField
          label={t('auth', 'email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          icon="mail-outline"
          keyboardType="email-address"
        />
        <AuthTextField
          label={t('auth', 'password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth', 'passwordHint')}
          secureTextEntry
          icon="lock-closed-outline"
        />

        {validationError && !error ? (
          <Text style={styles.validationHint}>{validationError}</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (loading || pressed) && styles.primaryBtnPressed,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>{t('auth', 'signUp')}</Text>
          )}
        </Pressable>
      </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -8,
    marginBottom: Layout.spacing.md,
    lineHeight: 17,
  },
  validationHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Layout.spacing.sm,
  },
  error: {
    color: '#C0392B',
    fontSize: 13,
    marginBottom: Layout.spacing.sm,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Layout.spacing.xs,
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
