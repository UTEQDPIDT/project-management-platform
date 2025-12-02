'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { UpdateUser, updateUserSchema } from '@/schemas/update-user.schema';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Sex, State, UserType } from '@repo/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function UserForm() {
  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      type: UserType.ESTUDIANTE,
      sex: Sex.HOMBRE,
      state: State.QRO,
      dateOfBirth: new Date(),
      matricula: undefined,
      employeeNumber: undefined,
    },
  });

  const onSubmit = (data: UpdateUser) => {
    // handle user update
    console.log(data);
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="sex"
            render={({ field: { onChange, onBlur, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Sexo</FieldLabel>
                <Select {...field} onValueChange={onChange}>
                  <SelectTrigger
                    id={field.name}
                    onBlur={onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Sex).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="state"
            render={({ field: { onChange, onBlur, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                  <FieldDescription>
                    El estado en el que recides actualmente.
                  </FieldDescription>
                </FieldContent>
                <Select {...field} onValueChange={onChange}>
                  <SelectTrigger
                    id={field.name}
                    onBlur={onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(State).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="type"
            render={({ field: { onChange, onBlur, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Tipo de Usuario</FieldLabel>
                  <FieldDescription>
                    Tu papel dentro de la plataforma. Esto tendrá efecto en tus
                    funciones.
                  </FieldDescription>
                </FieldContent>
                <Select {...field} onValueChange={onChange}>
                  <SelectTrigger
                    id={field.name}
                    onBlur={onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un papel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="matricula"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Matricula</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="employeeNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Número de Empleado</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit">Submit</Button>
        </FieldGroup>
      </form>
    </div>
  );
}
