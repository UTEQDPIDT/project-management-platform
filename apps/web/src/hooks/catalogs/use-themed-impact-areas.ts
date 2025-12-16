import { useQuery } from '@tanstack/react-query';
import { getThemedImpactAreas } from '@/services/themed-impact-areas.service';

export function useThemedImpactAreas() {
  return useQuery({
    queryKey: ['themed-impact-areas'],
    queryFn: getThemedImpactAreas,
  });
}
