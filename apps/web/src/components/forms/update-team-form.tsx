'use client';

import { teamSchema } from '@/schemas/team.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDivisions } from '@/hooks/catalogs';
import { useUpdateTeam } from '@/hooks/team';
import {
  SeedCategory,
  TeamsGrade,
  IUser,
  UserType,
  ITeam,
  TeamMembershipRole,
} from '@repo/types';
import LoadingMessage from '../loading-message';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
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
import { useRouter } from 'next/navigation';
import { useUserProfile } from 'context/profile-provider';
import Link from 'next/link';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import { ProfileInfo } from '../profile-info';
import { useGetTeamPickerUsers } from '@/hooks/user';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

type UpdateTeamFormProps = {
  team: ITeam;
};

export function UpdateTeamForm({ team }: UpdateTeamFormProps) {
  const router = useRouter();
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  /**
   * Tanstack
   */
  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const { data: users, isLoading: loadingUsers } = useGetTeamPickerUsers();
  const updateTeam = useUpdateTeam();

  // Extract members and collaborators by role from memberships
  const memberIds = team.memberships
    .filter((m) => m.role === TeamMembershipRole.MEMBER)
    .map((m) => m.user?._id)
    .filter(Boolean);
  const collaboratorIds = team.memberships
    .filter((m) => m.role === TeamMembershipRole.COLLABORATOR)
    .map((m) => m.user?._id)
    .filter(Boolean);

  // Filter out the current user and users already in memberships
  const existingUserIds = team.memberships
    .map((m) => m.user?._id)
    .filter(Boolean);
  const usersWithoutCurrentUserAndMembers =
    users?.filter(
      (u: IUser) => u._id !== user._id && !existingUserIds.includes(u._id),
    ) || [];
  const teachersAndAdmins = usersWithoutCurrentUserAndMembers.filter(
    (u: IUser) =>
      u.type === UserType.MAESTRO || u.type === UserType.ADMINISTRATIVO,
  );
  const teachersAndStudents = usersWithoutCurrentUserAndMembers.filter(
    (u: IUser) => u.type === UserType.MAESTRO || u.type === UserType.ESTUDIANTE,
  );

  const form = useForm<z.infer<ReturnType<typeof teamSchema>>>({
    resolver: zodResolver(teamSchema(user.email)),
    mode: 'onChange',
    defaultValues: {
      teamName: team.teamName || '',
      summary: team.summary || '',
      division: team.division?._id || '',
      grade: team.grade || TeamsGrade.CA_EN_FORMACION,
      members: memberIds,
      collaborators: collaboratorIds,
      isPrivate: team.isPrivate ?? true,
    },
  });

  const onSubmit = async (data: z.infer<ReturnType<typeof teamSchema>>) => {
    try {
      const cleanedData = {
        ...data,
        teamName: data.teamName,
        summary: data.summary === '' ? undefined : data.summary,
        division: data.division || undefined,
      };
      updateTeam.mutate({ teamId: team._id, teamData: cleanedData });
      form.reset();
      router.push(`${baseUrl}/equipos/${team._id}`);
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
                        className="textarea"
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
                          <Command
                            filter={(value, search) =>
                              value
                                .toLowerCase()
                                .includes(search.toLowerCase())
                                ? 1
                                : 0
                            }
                          >
                            <CommandInput placeholder="Buscar participante..." />
                            <CommandEmpty>
                              No se encontraron participantes.
                            </CommandEmpty>
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
                                    No hay más usuarios
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
          <Button asChild variant={'outline'} type="button">
            <Link href={`${baseUrl}/equipos/${team._id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={updateTeam.isPending}>
            {updateTeam.isPending ? (
              <LoadingMessage message="Creando equipo" />
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
