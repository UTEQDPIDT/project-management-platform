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
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  CareerLevel,
  Division,
  Sex,
  State,
  UserType,
  Program,
  User,
} from '@repo/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { useDivisions } from '@/hooks/use-divisions';
import { usePrograms } from '@/hooks/use-programs';
import LoadingMessage from '../loading-message';
import { useEffect } from 'react';
import { useUpdateUser } from '@/hooks/use-update-user';

export default function UserForm({ profile }: { profile: User }) {
  /**
   * React Query Hooks
   */
  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  const updateUserMutation = useUpdateUser();

  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      sex: profile.sex || Sex.HOMBRE,
      state: profile.state || State.QRO,
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : new Date(),
      type: profile.type || UserType.ESTUDIANTE,
      matricula: profile.matricula || '',
      careerLevel: profile.careerLevel || CareerLevel.LICENCIATURA,
      educationalProgram: profile.educationalProgram || '',
      division: profile.division || '',
      employeeNumber: profile.employeeNumber || '',
    },
  });

  const onSubmit = (data: UpdateUser) => {
    const cleanedData = {
      ...data,
      matricula: data.matricula === '' ? undefined : data.matricula,
      employeeNumber:
        data.employeeNumber === '' ? undefined : data.employeeNumber,
      educationalProgram:
        data.educationalProgram === '' ? undefined : data.educationalProgram,
      division: data.division === '' ? undefined : data.division,
    };
    console.log(cleanedData);
    updateUserMutation.mutate(cleanedData);
  };

  const onError = (errors: any) => {
    console.log('FORM ERRORS:', errors);
  };

  /**
   * Reset values when user type changes
   */
  const userType = form.watch('type');
  const { setValue } = form;

  useEffect(() => {
    if (userType === UserType.ESTUDIANTE) {
      setValue('employeeNumber', '');
    } else if (userType === UserType.MAESTRO) {
      setValue('matricula', '');
      setValue('educationalProgram', '');
    }
  }, [userType, form]);

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Información Personal</FieldLegend>
            <FieldGroup>
              <div className="flex gap-6 flex-col md:flex-row">
                <Controller
                  control={form.control}
                  name="sex"
                  render={({
                    field: { onChange, onBlur, ...field },
                    fieldState,
                  }) => (
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
                  name="dateOfBirth"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Fecha de Nacimiento
                      </FieldLabel>
                      <DatePicker
                        date={field.value}
                        onChange={field.onChange}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="state"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
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
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Información Institucional</FieldLegend>
            <FieldGroup>
              <Controller
                control={form.control}
                name="type"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Tipo de Usuario
                      </FieldLabel>
                      <FieldDescription>
                        Tu papel dentro de la plataforma. Esto tendrá efecto en
                        tus funciones.
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

              {userType === UserType.ESTUDIANTE && (
                <FieldGroup>
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
                    name="careerLevel"
                    render={({
                      field: { onChange, onBlur, ...field },
                      fieldState,
                    }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>
                            Nivel de Carrera
                          </FieldLabel>
                        </FieldContent>
                        <Select {...field} onValueChange={onChange}>
                          <SelectTrigger
                            id={field.name}
                            onBlur={onBlur}
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Selecciona tu nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(CareerLevel).map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
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
                    name="educationalProgram"
                    render={({
                      field: { onChange, onBlur, ...field },
                      fieldState,
                    }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Programa Educativo
                        </FieldLabel>
                        <Select {...field} onValueChange={onChange}>
                          <SelectTrigger
                            id={field.name}
                            onBlur={onBlur}
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Selecciona un programa" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingPrograms ? (
                              <LoadingMessage message="Cargando Programas" />
                            ) : (
                              programs.map((program: Program) => (
                                <SelectItem
                                  key={program._id}
                                  value={program._id}
                                >
                                  {program.educationalProgram}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              )}

              {userType === UserType.MAESTRO && (
                <Controller
                  control={form.control}
                  name="employeeNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Número de Empleado
                      </FieldLabel>
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
              )}

              <Controller
                control={form.control}
                name="division"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>División</FieldLabel>
                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        id={field.name}
                        onBlur={onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecciona una división" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingDivisions ? (
                          <LoadingMessage message="Cargando divisiones" />
                        ) : (
                          divisions.map((division: Division) => (
                            <SelectItem key={division._id} value={division._id}>
                              {division.division}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <div className="flex flex-col md:flex-row gap-2 justify-end">
            <Button
              onClick={() => form.reset()}
              type="button"
              variant={'outline'}
            >
              Cancelar
            </Button>
            <Button disabled={updateUserMutation.isPending} type="submit">
              {updateUserMutation.isPending ? (
                <LoadingMessage message="Guardando" />
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
