import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/users.service';

export function useGetAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
}
