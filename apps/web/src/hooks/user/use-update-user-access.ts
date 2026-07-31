import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserAccess } from '@/services/users.service';

export function useUpdateUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}