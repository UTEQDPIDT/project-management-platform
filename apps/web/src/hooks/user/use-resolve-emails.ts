import { useMutation } from '@tanstack/react-query';
import { resolveEmails } from '@/services/user.service';

export function useResolveEmails() {
  useMutation({
    mutationFn: resolveEmails,
  });
}
