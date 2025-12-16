import { useQuery } from '@tanstack/react-query';
import { getKnowledgeAreas } from '@/services/knowledge-areas.service';

export function useKnowledgeAreas() {
  return useQuery({
    queryKey: ['knowledge-areas'],
    queryFn: getKnowledgeAreas,
  });
}
