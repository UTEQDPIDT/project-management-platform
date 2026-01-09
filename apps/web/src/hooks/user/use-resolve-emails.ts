import { useMutation } from '@tanstack/react-query';
import { resolveEmails } from '@/services/users.service';

export function useResolveEmails() {
  useMutation({
    mutationFn: resolveEmails,
  });
}
