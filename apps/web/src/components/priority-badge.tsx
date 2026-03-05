import { Badge } from './ui/badge';

type Priority = 'Alta' | 'Media' | 'Baja';

const priorityVariants: Record<Priority, 'purple' | 'orange' | 'gray'> = {
  Alta: 'purple',
  Media: 'orange',
  Baja: 'gray',
};

interface PriorityBadgeProps {
  priority?: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) return null;
  return <Badge variant={priorityVariants[priority]}>{priority}</Badge>;
}
