'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { api } from '@/lib/axios';
import { uteqEmailRegex } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z
    .string()
    .email('El correo es inválido')
    .regex(uteqEmailRegex, 'El correo debe ser un correo institucional: @uteq.edu.mx'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export default function MockLoginForm() {
  const router = useRouter();

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (payload: z.infer<typeof schema>) => {
    try {
      const { data } = await api.post('/auth/mock-login', payload);
      router.push(data.redirectUrl);
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      toast.error('Error al iniciar sesión, credenciales inválidas');
    }
  };

  const onError = (errors: any) => {};

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit, onError)}
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
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Contraseña</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="current-password"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit">Iniciar Sesión</Button>
    </form>
  );
}
