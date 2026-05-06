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
import Link from 'next/link';
import { EyePasswordInput } from '../ui/eye-password-input';

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
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <FieldGroup className='pt-2 pb-2 gap-4'>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel className='font-normal'>Correo electrónico:</FieldLabel>
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
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <div className="flex items-center justify-between">
                <FieldLabel className='font-normal'>Contraseña:</FieldLabel>
                <Link
                  href="/olvide-mi-contrasena"
                  className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <EyePasswordInput
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="current-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className='bg-[#242D55] font-semibold h-12 hover:bg-[#1e2547] text-white cursor-pointer'>Iniciar Sesión</Button>

    </form>
  );
}
