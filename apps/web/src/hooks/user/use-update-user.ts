import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUser } from '@/services/users.service';
import { toast } from 'sonner';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'users', 'user'] });
      toast.success('Perfil actualizado');
    },
    onError: () => toast.error('No se actualizó el perfil'),
  });
}
