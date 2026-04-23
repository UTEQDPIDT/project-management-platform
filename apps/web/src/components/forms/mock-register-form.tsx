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
import { EyePasswordInput } from '../ui/eye-password-input';

const schema = z.object({
    givenName: z.string().min(1, 'El nombre debe tener al menos 1 caracter'),
    familyName: z.string().min(1, 'El apellido debe tener al menos 1 caracter'),
    email: z
        .string()
        .email('El correo es inválido')
        .regex(uteqEmailRegex, 'El correo debe ser un correo institucional: @uteq.edu.mx'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'La confirmación de contraseña debe tener al menos 8 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
    });

export default function MockRegisterForm() {
    const router = useRouter();

    const form = useForm({
        mode: 'onSubmit',
        resolver: zodResolver(schema),
        defaultValues: {
            givenName: '',
            familyName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

const onSubmit = async (payload: z.infer<typeof schema>) => {
    try {
        const { confirmPassword, ...registerPayload } = payload;
        const { data } = await api.post('/auth/mock-register', registerPayload);
        router.push(data.redirectUrl);
        toast.success('Registro exitoso');
    } catch (error) {
        const responseData =
            typeof error === 'object' && error !== null && 'response' in error
                ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data
                : undefined;

        const backendMessage = Array.isArray(responseData?.message)
            ? responseData.message.join(', ')
            : responseData?.message;

        toast.error(backendMessage || 'Error al registrar usuario');
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
                name="givenName"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nombre</FieldLabel>
                        <Input 
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Nombre"
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                control={form.control}
                name="familyName"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Apellido</FieldLabel>
                        <Input 
                        {...field} 
                        aria-invalid={fieldState.invalid} 
                        placeholder="Apellido"
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Correo electrónico</FieldLabel>
                        <Input {...field} aria-invalid={fieldState.invalid} 
                        type="email" 
                        placeholder="ejemplo@uteq.edu.mx" />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Contraseña</FieldLabel>
                        <EyePasswordInput
                        {...field} 
                        aria-invalid={fieldState.invalid} 
                        placeholder="********"
                        autoComplete='new-password' 
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Confirmar Contraseña</FieldLabel>
                        <EyePasswordInput
                        {...field} 
                        aria-invalid={fieldState.invalid} 
                        placeholder="********"
                        autoComplete='new-password' 
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
        </FieldGroup>
        <Button type="submit">Registrar</Button>
    </form>
        
);
}