'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { UpdateUser, updateUserSchema } from '@/schemas/update-user.schema';

import { useDivisions, usePrograms } from '@/hooks/catalogs';
import { useUpdateUser } from '@/hooks/user';
import {
  CareerLevel,
  EducationLevel,
  IUser,
  ResearcherType,
  Sex,
  SniiLevel,
  UserType,
  SeedCategory,
} from '@repo/types';
import { useEffect } from 'react';
import LoadingMessage from '../loading-message';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DialogClose } from '../ui/dialog';
import { toast } from 'sonner';

const UNSET = '__unset__';
const YES_NO_OPTIONS = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
];

function NullableSelect({
  id,
  value,
  onChange,
  options,
  invalid,
}: {
  id: string;
  value: string | boolean | null | undefined;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
  invalid?: boolean;
}) {
  return (
    <Select
      value={value === null || value === undefined ? UNSET : String(value)}
      onValueChange={(next) => onChange(next === UNSET ? null : next)}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET}>Sin especificar</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const enumOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

export default function UserForm({
  profile,
  onSuccess,
}: {
  profile: IUser;
  onSuccess?: () => void;
}) {
  /**
   * React Query Hooks
   */
  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  const updateUserMutation = useUpdateUser();

  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      givenName: profile.givenName || '',
      familyName: profile.familyName || '',
      sex: profile.sex ?? null,
      hasDisability: profile.hasDisability ?? null,
      speaksIndigenousLanguage: profile.speaksIndigenousLanguage ?? null,
      researcherType: profile.researcherType ?? null,
      educationLevel: profile.educationLevel ?? null,
      sniiLevel: profile.sniiLevel ?? null,
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : new Date(),
      type: profile.type || UserType.ESTUDIANTE,
      careerLevel: profile.careerLevel || CareerLevel.LICENCIATURA,
      educationalProgram: profile.educationalProgram?._id || '',
      division: profile.division?._id || '',
    },
  });

  const onSubmit = (data: UpdateUser) => {
    const cleanedData = {
      ...data,
      educationalProgram:
        data.educationalProgram === '' ? undefined : data.educationalProgram,
      division: data.division === '' ? undefined : data.division,
    };
    updateUserMutation.mutate(
      { userId: profile._id, data: cleanedData },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const onError = () => {
    // console.log('FORM ERRORS:', errors);
    toast.error('Por favor corrige los errores en el formulario');
  };

  /**
   * Reset values when user type changes
   */
  const userType = form.watch('type');
  const { setValue } = form;

  useEffect(() => {
    if (
      userType === UserType.MAESTRO ||
      userType === UserType.ADMINISTRATIVO
    ) {
      setValue('educationalProgram', '');
    }
  }, [userType, form, setValue]);

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Información Personal</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                
                <Controller
                  control={form.control}
                  name="givenName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Nombre/s</FieldLabel>
                      <Input {...field} id={field.name} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="familyName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Apellido/s</FieldLabel>
                      <Input {...field} id={field.name} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="sex"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Sexo</FieldLabel>
                      <NullableSelect
                        id={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        options={enumOptions(Object.values(Sex))}
                        invalid={fieldState.invalid}
                      />
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

                <Controller
                  control={form.control}
                  name="hasDisability"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        ¿Tiene alguna discapacidad?
                      </FieldLabel>
                      <NullableSelect
                        id={field.name}
                        value={field.value}
                        onChange={(value) =>
                          field.onChange(value === null ? null : value === 'true')
                        }
                        options={YES_NO_OPTIONS}
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="speaksIndigenousLanguage"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        ¿Habla alguna lengua indígena?
                      </FieldLabel>
                      <NullableSelect
                        id={field.name}
                        value={field.value}
                        onChange={(value) =>
                          field.onChange(value === null ? null : value === 'true')
                        }
                        options={YES_NO_OPTIONS}
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Información Académica</FieldLegend>
            <FieldGroup>
              <Controller
                control={form.control}
                name="educationLevel"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nivel de estudios</FieldLabel>
                    <NullableSelect
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      options={enumOptions(Object.values(EducationLevel))}
                      invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="researcherType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Tipo de investigador
                    </FieldLabel>
                    <NullableSelect
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      options={enumOptions(Object.values(ResearcherType))}
                      invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="sniiLevel"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nivel SNII</FieldLabel>
                    <NullableSelect
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      options={enumOptions(Object.values(SniiLevel))}
                      invalid={fieldState.invalid}
                    />
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
                        className="w-full"
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
                            className="w-full"
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
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Selecciona un programa" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingPrograms ? (
                              <LoadingMessage message="Cargando Programas" />
                            ) : (
                              programs.map((program: SeedCategory) => (
                                <SelectItem
                                  key={program._id}
                                  value={program._id}
                                >
                                  {program.name}
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
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecciona una división" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingDivisions ? (
                          <LoadingMessage message="Cargando divisiones" />
                        ) : (
                          divisions.map((division: SeedCategory) => (
                            <SelectItem key={division._id} value={division._id}>
                              {division.name}
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
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant={'outline'}>
                Cancelar
              </Button>
            </DialogClose>

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
