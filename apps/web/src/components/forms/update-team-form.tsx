'use client';

import { ITeam } from '@repo/types';
import { teamSchema } from '@/schemas/team.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useDivisions } from '@/hooks/catalogs';
import { useUpdateTeam } from '@/hooks/team';

import { resolveEmails } from '@/services/users.service';

import { SeedCategory, IResolvedEmail, TeamsGrade } from '@repo/types';
import { PlusIcon, XIcon } from 'lucide-react';
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
import { useRouter } from 'next/navigation';
import { userProfile } from 'context/profile-provider';
import Link from 'next/link';
import { getBaseUrlBasedOnRole } from '@/lib/utils';

export function UpdateTeamForm({
  _id: teamId,
  teamName,
  summary,
  division,
  grade,
  members,
  collaborators,
  isPrivate,
}: Pick<
  ITeam,
  | '_id'
  | 'teamName'
  | 'summary'
  | 'division'
  | 'grade'
  | 'members'
  | 'collaborators'
  | 'isPrivate'
>) {
  const router = useRouter();

  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  /**
   * React Query Hooks
   */
  const { data: divisions, isLoading: loadingDivisions } = useDivisions();
  const updateTeam = useUpdateTeam();

  const form = useForm<z.infer<ReturnType<typeof teamSchema>>>({
    resolver: zodResolver(teamSchema(user.email)),
    mode: 'onChange',
    defaultValues: {
      teamName: teamName || '',
      summary: summary || '',
      division: division?._id || '',
      grade: grade || TeamsGrade.FORMACION,
      members: members.map((m) => m.email) || [],
      collaborators: collaborators.map((m) => m.email) || [],
      isPrivate: isPrivate || true,
    },
  });

  /**
   * Array Fields
   */
  const {
    fields: membersField,
    append: addMember,
    remove: removeMember,
  } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  const {
    fields: collaboratorsField,
    append: addCollaborator,
    remove: removeCollaborator,
  } = useFieldArray({
    control: form.control,
    name: 'collaborators',
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<ReturnType<typeof teamSchema>>) => {
    try {
      let resolvedMembersEmails;
      let membersIds;
      let resolvedCollaboratorsEmails;
      let collaboratorsIds;

      if (data.members.length > 0) {
        // resolve all emails -> userIds for members
        resolvedMembersEmails = await resolveEmails(data.members);
        // filter valid ids
        membersIds = resolvedMembersEmails
          .filter((m: IResolvedEmail) => m._id !== null)
          .map((m: IResolvedEmail) => m._id);
      }

      if (data.collaborators.length > 0) {
        resolvedCollaboratorsEmails = await resolveEmails(data.collaborators);

        collaboratorsIds = resolvedCollaboratorsEmails
          .filter((c: IResolvedEmail) => c._id !== null)
          .map((c: IResolvedEmail) => c._id);
      }

      const cleanedData = {
        ...data,
        teamName: data.teamName,
        summary: data.summary === '' ? undefined : data.summary,
        division: data.division === '' ? undefined : data.division,
        members: data.members.length > 0 ? membersIds : [],
        collaborators: data.collaborators.length > 0 ? collaboratorsIds : [],
      };
      updateTeam.mutate({ teamId, teamData: cleanedData });
      form.reset();
      router.push(`${baseUrl}/equipos/${teamId}`);
    } catch (err) {
      console.error('Error cleaning data', err);
    }
  };

  const onError = (errors: any) => {
    console.log('FORM ERRORS', errors);
  };

  return (
    <div>
      <form
        className="flex flex-col gap-6 lg:max-w-2xl"
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
              <FieldGroup className="gap-4">
                {membersField.map((member, idx) => (
                  <Controller
                    key={member.id}
                    control={form.control}
                    name={`members.${idx}`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id={`member-${idx}`}
                              aria-label={`Member ${idx + 1}`}
                              aria-invalid={fieldState.invalid}
                              placeholder="nombre@uteq.edu.mx"
                              type="email"
                              autoComplete="email"
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeMember(idx)}
                                aria-label={`Remove member ${idx + 1}`}
                              >
                                <XIcon />
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                ))}
                {form.formState.errors.members?.root?.message && (
                  <FieldError
                    errors={[
                      {
                        message: form.formState.errors.members.root.message,
                      },
                    ]}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addMember('')}
                >
                  <PlusIcon />
                  Añadir miembro
                </Button>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend variant="label" className="mb-2">
                Colaboradores
              </FieldLegend>
              <FieldDescription>
                Los colaboradores tienen acceso límitado a los contenidos del
                equipo, solo podrán visualizar y descargar contenidos.
              </FieldDescription>
              <FieldGroup className="gap-4">
                {collaboratorsField.map((collaborator, idx) => (
                  <Controller
                    key={collaborator.id}
                    control={form.control}
                    name={`collaborators.${idx}`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id={`collaborator-${idx}`}
                              aria-label={`Colaborador ${idx + 1}`}
                              aria-invalid={fieldState.invalid}
                              placeholder="nombre@uteq.edu.mx"
                              type="email"
                              autoComplete="email"
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeCollaborator(idx)}
                                aria-label={`Remove collaborator ${idx + 1}`}
                              >
                                <XIcon />
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                ))}
                {form.formState.errors.collaborators?.root?.message && (
                  <FieldError
                    errors={[
                      {
                        message:
                          form.formState.errors.collaborators.root.message,
                      },
                    ]}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCollaborator('')}
                >
                  <PlusIcon />
                  Añadir colaborador
                </Button>
              </FieldGroup>
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
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
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
            <Link href={`${baseUrl}/equipos/${teamId}`}>Cancelar</Link>
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
