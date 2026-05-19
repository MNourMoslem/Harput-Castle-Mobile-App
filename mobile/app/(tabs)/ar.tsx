import React from 'react';
import SimpleInfoScreen from '@/components/ui/SimpleInfoScreen';
import { useLocale } from '@/services/i18n';

export default function ArScreen() {
  const { t } = useLocale();

  return (
    <SimpleInfoScreen
      icon="scan-outline"
      title="AR"
      subtitle={t('common', 'screenInProgress')}
    />
  );
}
