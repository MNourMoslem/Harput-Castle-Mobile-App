import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import InfoChip from '@/components/ui/InfoChip';

interface StatChipProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}

export default function StatChip({ icon, value, label }: StatChipProps) {
  return <InfoChip icon={icon} value={value} label={label} variant="stat" />;
}
