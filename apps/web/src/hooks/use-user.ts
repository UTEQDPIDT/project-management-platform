import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/user.service';

export function useUser() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });
}
