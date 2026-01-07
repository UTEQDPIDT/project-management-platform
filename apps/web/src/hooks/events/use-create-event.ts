import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/admin/eventos');
      toast.success('El evento ha sido creado');
    },
    onError: () => {
      toast.error('No se ha creado el evento');
    },
  });
}
