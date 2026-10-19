import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  applyFirstValidation,
  cancelFirstValidation,
  closeEvent,
  reopenEvent,
} from '@/services/events.service';
import { toast } from 'sonner';

const useEventMutation = (
  mutationFn: (eventId: string) => Promise<unknown>,
  successMessage: string,
  errorMessage: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-events'] });
      toast.success(successMessage);
    },
    onError: () => toast.error(errorMessage),
  });
};

export const useFirstValidationEvent = () =>
  useEventMutation(applyFirstValidation, 'Evento aprobado', 'No se pudo aprobar el evento');

export const useCancelFirstValidationEvent = () =>
  useEventMutation(cancelFirstValidation, 'Aprobación cancelada', 'No se pudo cancelar la aprobación');

export const useCloseEvent = () =>
  useEventMutation(closeEvent, 'Evento cerrado', 'No se pudo cerrar el evento');

export const useReopenEvent = () =>
  useEventMutation(reopenEvent, 'Evento reabierto', 'No se pudo reabrir el evento');
