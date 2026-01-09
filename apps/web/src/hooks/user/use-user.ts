import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/users.service';

export function useUser() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });
}
