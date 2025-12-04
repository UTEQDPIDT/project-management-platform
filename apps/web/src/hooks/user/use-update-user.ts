import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUser } from '@/services/user.service';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
