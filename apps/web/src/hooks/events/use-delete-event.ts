import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se ha eliminado el evento');
      router.push('/admin/eventos');
    },
    onError: () => toast.error('No se ha eliminado el evento'),
  });
}
