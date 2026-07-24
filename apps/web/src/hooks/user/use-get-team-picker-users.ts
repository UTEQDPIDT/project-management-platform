import { useQuery } from '@tanstack/react-query';
import { getTeamPickerUsers } from '@/services/users.service';

export function useGetTeamPickerUsers() {
  return useQuery({
    queryKey: ['users', 'team-picker'],
    queryFn: getTeamPickerUsers,
  });
}
