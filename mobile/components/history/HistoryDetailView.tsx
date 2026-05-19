import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { HistorySection } from '@/types/history';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface HistoryDetailViewProps {
  sections: HistorySection[];
}

export default function HistoryDetailView({ sections }: HistoryDetailViewProps) {
  return (
    <View style={styles.container}>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'paragraph':
            return (
              <Text key={index} style={styles.paragraph}>
                {section.text}
              </Text>
            );

          case 'heading':
            return (
              <Text key={index} style={styles.heading}>
                {section.text}
              </Text>
            );

          case 'quote':
            return (
              <View key={index} style={styles.quoteContainer}>
                <View style={styles.quoteBar} />
                <View style={styles.quoteInner}>
                  <Text style={styles.quoteText}>"{section.text}"</Text>
                  {section.attribution ? (
                    <Text style={styles.quoteAttribution}>— {section.attribution}</Text>
                  ) : null}
                </View>
              </View>
            );

          case 'image':
            return (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: section.url }}
                  style={styles.image}
                  contentFit="cover"
                />
                {section.caption ? (
                  <Text style={styles.imageCaption}>{section.caption}</Text>
                ) : null}
              </View>
            );

          case 'fact_list':
            return (
              <View key={index} style={styles.factList}>
                {section.items.map((item, i) => (
                  <View key={i} style={styles.factItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.factText}>{item}</Text>
                  </View>
                ))}
              </View>
            );

          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.base,
    paddingBottom: Layout.spacing.xl,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.md,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  quoteContainer: {
    flexDirection: 'row',
    marginVertical: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
  quoteBar: {
    width: 4,
    backgroundColor: Colors.accent,
  },
  quoteInner: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  quoteAttribution: {
    marginTop: Layout.spacing.sm,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'normal',
  },
  imageContainer: {
    marginVertical: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageCaption: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: Colors.background,
  },
  factList: {
    marginVertical: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
    flexShrink: 0,
  },
  factText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});
