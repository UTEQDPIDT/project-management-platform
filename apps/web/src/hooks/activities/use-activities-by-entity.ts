import { useQuery } from '@tanstack/react-query';
import { getActivitiesByEntityId } from '@/services/activities.service';

export const useActivitiesByEntity = (entityId: string) => {
  return useQuery({
    queryKey: ['activities', entityId],
    queryFn: () => getActivitiesByEntityId(entityId),
    enabled: !!entityId,
  });
};
