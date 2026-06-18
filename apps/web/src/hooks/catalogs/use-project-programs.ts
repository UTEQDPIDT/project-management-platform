import { useQuery } from '@tanstack/react-query';
import { getProjectPrograms } from '@/services/project-programs.service';

export function useProjectPrograms(){
    return useQuery({
        queryKey: ['projectPrograms'],
        queryFn: getProjectPrograms
    });
}
