'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { resetPassword } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { uteqEmailRegex } from '@/lib/utils';

const schema = z
  .object({
    email: z
      .string()
      .email('El correo es inválido')
      .regex(uteqEmailRegex, 'El correo debe ser un correo institucional: @uteq.edu.mx'),
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: { email: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (payload: z.infer<typeof schema>) => {
    try {
      await resetPassword({ token, ...payload });
      toast.success('Contraseña restablecida correctamente');
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ?? 'Error al restablecer la contraseña';
        toast.error(Array.isArray(message) ? message.join(', ') : message);
      } else {
        toast.error('Error al restablecer la contraseña');
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Correo electrónico</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="ejemplo@uteq.edu.mx"
                autoComplete="email"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nueva contraseña</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="new-password"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Confirmar contraseña</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="new-password"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
      </Button>
    </form>
  );
}
