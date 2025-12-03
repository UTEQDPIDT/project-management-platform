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

export default function UserForm() {
  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      sex: Sex.HOMBRE,
      state: State.QRO,
      dateOfBirth: new Date(),
      type: UserType.ESTUDIANTE,
      matricula: undefined,
      careerLevel: CareerLevel.LICENCIATURA,
      educationalProgram: undefined,
      division: undefined,
      employeeNumber: undefined,
    },
  });

  const onSubmit = (data: UpdateUser) => {
    // handle user update
    console.log(data);
  };

  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const { data: programs, isLoading: loadingPrograms } = usePrograms();

  const userType = form.watch('type');

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                            <SelectValue placeholder="Selecciona un papel" />
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
          <Button type="submit">Guardar Cambios</Button>
        </FieldGroup>
      </form>
    </div>
  );
}
