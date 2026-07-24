'use client';

import { teamSchema } from '@/schemas/team.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDivisions } from '@/hooks/catalogs';
import { useCreateTeam } from '@/hooks/team';
import { useGetTeamPickerUsers } from '@/hooks/user';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { IUser, SeedCategory, TeamsGrade, UserType } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingMessage from '../loading-message';
import { ProfileInfo } from '../profile-info';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

export function CreateTeamForm() {
  const router = useRouter();
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  /**
   * React Query Hooks
   */
  const { data: users, isLoading: loadingUsers } = useGetTeamPickerUsers();
  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const createTeamMutation = useCreateTeam();

  // Filter out the current user from the list
  const filteredUsers = users?.filter((u: IUser) => u._id !== user._id) || [];
  const teachersAndAdmins = filteredUsers.filter(
    (u: IUser) =>
      u.type === UserType.MAESTRO || u.type === UserType.ADMINISTRATIVO,
  );
  const teachersAndStudents = filteredUsers.filter(
    (u: IUser) => u.type === UserType.MAESTRO || u.type === UserType.ESTUDIANTE,
  );

  const form = useForm<z.infer<ReturnType<typeof teamSchema>>>({
    resolver: zodResolver(teamSchema(user.email)),
    mode: 'onChange',
    defaultValues: {
      teamName: '',
      summary: '',
      division: '',
      grade: TeamsGrade.GRUPO_DE_INVESTIGACION,
      members: [],
      collaborators: [],
      isPrivate: true,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<ReturnType<typeof teamSchema>>) => {
    try {
      const cleanedData = {
        ...data,
        teamName: data.teamName,
        summary: data.summary === '' ? undefined : data.summary,
        division: data.division || undefined,
      };
      createTeamMutation.mutate(cleanedData);
      form.reset();
      router.push(`${baseUrl}/equipos`);
    } catch (err) {
      console.error('Error cleaning data', err);
    }
  };

  const onError = () => {
    toast.error('Por favor corrige los errores en el formulario');
  };

  return (
    <div className="w-full flex justify-center">
      <form
        className="flex flex-col gap-6 w-full max-w-2xl"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Datos del Equipo</CardTitle>
            <CardDescription>
              Los campos obligatorios están marcados con asterisco.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="teamName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombre *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Nuevos Talentos"
                      />
                      <InputGroupAddon align="inline-end">
                        {field.value?.length}/50
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="summary"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                      <FieldDescription>
                        Describe brevemente el propósito del equipo, áreas de
                        innovación, metas, responsabilidades...
                      </FieldDescription>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Equipo centrado en fortalecer las habilidades de los estudiantes por medio de proyectos de alto impácto..."
                      />
                      <InputGroupAddon align="block-end">
                        {field.value?.length}/255
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

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
                        className="border-zinc-300"
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

              <Controller
                control={form.control}
                name="grade"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Grado</FieldLabel>
                      <FieldDescription>
                        Refiere al nivel de maduración del equipo.
                      </FieldDescription>
                    </FieldContent>
                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        id={field.name}
                        onBlur={onBlur}
                        aria-invalid={fieldState.invalid}
                        className="border-zinc-300"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TeamsGrade).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrantes</CardTitle>
            <CardDescription>
              Invita a personas a formar parte de tu equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <FieldSet>
              <FieldLegend variant="label" className="mb-2">
                Miembros
              </FieldLegend>
              <FieldDescription>
                Los miembros tienen acceso completo a los proyectos del equipo.
              </FieldDescription>
              <Controller
                control={form.control}
                name="members"
                render={({ field }) => {
                  const value = field.value ?? [];
                  return (
                    <FieldGroup>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-normal"
                          >
                            {value.length ? (
                              `${value.length} seleccionados`
                            ) : (
                              <span className="text-muted-foreground font-normal">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full md:w-xl max-h-96 overflow-y-auto p-0">
                          <Command filter={(value, search) =>
                            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                          }>
                            <CommandInput placeholder="Buscar participante..." />
                            <CommandEmpty>No se encontraron participantes.</CommandEmpty>
                            <CommandGroup>
                              {loadingUsers ? (
                                <CommandItem disabled>
                                  <LoadingMessage />
                                </CommandItem>
                              ) : teachersAndStudents?.length > 0 ? (
                                teachersAndStudents.map((user: IUser) => {
                                  const selected = value.includes(user._id);
                                  return (
                                    <CommandItem
                                      key={user._id}
                                      value={`${user.givenName} ${user.familyName}`}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== user._id,
                                              )
                                            : [...value, user._id],
                                        );
                                      }}
                                      className="flex justify-between"
                                    >
                                      <ProfileInfo
                                        givenName={user.givenName}
                                        familyName={user.familyName}
                                        avatarUrl={user.avatarUrl}
                                        userType={user.type}
                                        size="sm"
                                      />
                                      <Check
                                        className={`mr-2 h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`}
                                      />
                                    </CommandItem>
                                  );
                                })
                              ) : (
                                <div className="w-full select-none p-2 flex items-center justify-center">
                                  <span className="text-muted-foreground text-sm">
                                    No se encontraron usuarios.
                                  </span>
                                </div>
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajustes</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="isPrivate"
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <Field
                    orientation={'horizontal'}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Equipo Privado
                      </FieldLabel>
                      <FieldDescription>
                        Las personas sólo podrán ingresar al equipo por medio de
                        invitación directa.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant={'outline'} type="button" asChild>
            <Link href={`${baseUrl}/equipos`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={createTeamMutation.isPending}>
            {createTeamMutation.isPending ? (
              <LoadingMessage message="Creando equipo" />
            ) : (
              'Crear equipo'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
