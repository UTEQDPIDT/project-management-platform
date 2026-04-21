'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { uteqEmailRegex } from '@/lib/utils';
import { toast } from 'sonner';
import { forgotPassword } from '@/services/auth.service';
import { useState } from 'react';

const schema = z.object({
  email: z
    .string()
    .email('El correo es inválido')
    .regex(uteqEmailRegex, 'El correo debe ser un correo institucional: @uteq.edu.mx'),
});

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (payload: z.infer<typeof schema>) => {
    try {
      await forgotPassword(payload.email);
    } catch {
      // siempre mostramos el mismo mensaje para no revelar si el correo existe
    } finally {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Si el correo está registrado, recibirás un enlace para restablecer tu
        contraseña en los próximos minutos.
      </p>
    );
  }

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
      </FieldGroup>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Enviando...' : 'Enviar enlace'}
      </Button>
    </form>
  );
}
