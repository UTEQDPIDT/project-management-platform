import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Status } from '@repo/types';

const statusVariants: Record<Status, 'gray' | 'blue' | 'green'> = {
  Pendiente: 'gray',
  'En Progreso': 'blue',
  Completado: 'green',
  Cerrado: 'gray',
};

interface StatusBadgeProps {
  status?: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
