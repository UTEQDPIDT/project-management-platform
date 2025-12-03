import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserProfile, updateUser } from '@/services/user.service';

export function useUser() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });
}
