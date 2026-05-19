import React from 'react';
import SimpleInfoScreen from '@/components/ui/SimpleInfoScreen';
import { useLocale } from '@/services/i18n';

export default function AssistantScreen() {
  const { t } = useLocale();

  return (
    <SimpleInfoScreen
      icon="sparkles-outline"
      title={t('common', 'navAssistant')}
      subtitle={t('common', 'screenInProgress')}
    />
  );
}
