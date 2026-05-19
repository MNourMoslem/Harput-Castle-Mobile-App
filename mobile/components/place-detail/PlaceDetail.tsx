import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PlaceDetailSheet, { StatItem } from './PlaceDetailSheet';
import SectionCard from '@/components/ui/SectionCard';
import type { PlaceMeta } from '@/types/place';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { PLACE_DETAIL_SCHEMA, type PlaceId } from '@/constants/placeDetailSchema';
import type { PlaceDetailRawData } from '@/types/placeDetail';
import { useLocale } from '@/services/i18n';
import {
  buildStatItem,
  extractStringEntries,
} from '@/services/placeDetail';
import { getPlaceData } from '@/services/places';

interface PlaceDetailProps {
  meta: PlaceMeta;
  visible: boolean;
  onClose: () => void;
}

/**
 * Generic, data-driven PlaceDetail component.
 * Renders all place details based on config/schema and placeId.
 */
export default function PlaceDetail({ meta, visible, onClose }: PlaceDetailProps) {
  const { locale, t } = useLocale();
  const placeId = meta.id as PlaceId;
  const schema = PLACE_DETAIL_SCHEMA[placeId];
  const data = getPlaceData(placeId, locale) as unknown as PlaceDetailRawData;

  if (!schema) {
    return (
      <PlaceDetailSheet meta={meta} visible={visible} onClose={onClose}>
        <SectionCard title={t('place', 'sectionAbout')}>
          <Text style={styles.bodyText}>{String(data.about ?? meta.shortDescription)}</Text>
        </SectionCard>
      </PlaceDetailSheet>
    );
  }

  const statItems = schema.stats
    .map((field) => buildStatItem(data, field, (key) => t('place', key)))
    .filter((item): item is { icon: React.ComponentProps<typeof StatItem>['icon']; value: string; label: string } => Boolean(item));

  return (
    <PlaceDetailSheet meta={meta} visible={visible} onClose={onClose}>
      {schema.textSections.map((section) => {
        const value = data[section.dataKey];
        if (typeof value !== 'string' || !value.trim()) {
          return null;
        }

        return (
          <SectionCard key={section.dataKey} title={t('place', section.sectionKey)}>
            <Text style={styles.bodyText}>{value}</Text>
          </SectionCard>
        );
      })}

      {schema.statsSectionKey && statItems.length > 0 ? (
        <SectionCard title={t('place', schema.statsSectionKey)}>
          <View style={styles.statGrid}>
            {statItems.map((stat) => (
              <StatItem
                key={`${stat.label}-${stat.value}`}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </View>
        </SectionCard>
      ) : null}

      {schema.listSections?.map((section) => {
        const entries = extractStringEntries(data[section.dataKey]);

        if (entries.length === 0) {
          return null;
        }

        return (
          <SectionCard key={section.dataKey} title={t('place', section.sectionKey)}>
            <View style={styles.listWrap}>
              {entries.map((entry) => (
                <View key={entry} style={styles.listChip}>
                  <Text style={styles.listChipIcon}>•</Text>
                  <Text style={styles.listChipText}>{entry}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        );
      })}
    </PlaceDetailSheet>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  listWrap: {
    gap: Layout.spacing.sm,
  },
  listChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.sm,
  },
  listChipIcon: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  listChipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
});
