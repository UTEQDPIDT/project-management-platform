'use client';

import {
  IActivity,
  IUser,
  Priority,
  Status,
  EntityType,
  ITeamMembership,
} from '@repo/types';
import { useCreateActivity, useUpdateActivity } from '@/hooks/activities';
import { useProject } from '@/hooks/projects';
import React, { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../ui/input-group';
import { activityZodSchema } from '@/schemas/activity.schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandGroup, CommandItem } from '../ui/command';
import LoadingMessage from '../loading-message';
import { toast } from 'sonner';
import { ProfileInfo } from '../profile-info';

interface Props {
  activity?: IActivity;
  projectId?: string;
  eventId?: string;
}

export function ActivityForm({ activity, projectId, eventId }: Props) {
  /**
   * Tanstack hooks
   */
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();

  const context = useMemo(() => {
    if (projectId) return 'project';
    if (eventId) return 'event';
  }, [projectId, eventId]);

  if (!context) {
    throw new Error('ActivityForm requires either a projectId or eventId');
  }

  const entityId = projectId || eventId || '';
  const entityType: EntityType =
    context === 'project' ? EntityType.PROJECT : EntityType.EVENT;

  // Load project members (owner + team members).
  // `useProject` is safe to call with an empty id because it uses
  // `enabled: !!projectId` internally; this keeps hooks order stable.
  const { data: project, isLoading: loadingProject } = useProject(
    projectId || '',
  );

  const members: IUser[] = React.useMemo(() => {
    if (!project) return [];
    const list: IUser[] = [];
    if (project.owner) list.push(project.owner);
    if (project.team?.memberships && project.team.memberships.length > 0) {
      list.push(
        ...project.team.memberships.map((m: ITeamMembership) => m.user),
      );
    }

    // dedupe by _id
    const map = new Map<string, IUser>();
    list.forEach((u) => {
      if (u && u._id) map.set(u._id, u);
    });
    return Array.from(map.values());
  }, [project]);

  const isSubmiting =
    createActivityMutation.isPending || updateActivityMutation.isPending;

  const form = useForm({
    resolver: zodResolver(activityZodSchema),
    mode: 'onChange',
    defaultValues: {
      name: activity?.name || '',
      description: activity?.description || '',
      status: activity?.status || Status.PENDING,
      priority: activity?.priority || Priority.LOW,
      checked: activity?.checked || false,
      assignees:
        activity?.assignees && activity.assignees.length > 0
          ? activity.assignees.map((a: IUser) => a._id)
          : [],
      dueDate: activity?.dueDate ? new Date(activity.dueDate) : undefined,
      dueDateEnd: activity?.dueDateEnd
        ? new Date(activity.dueDateEnd)
        : undefined,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<typeof activityZodSchema>) => {
    try {
      const cleanedData = {
        ...data,
        description: data.description ? data.description?.trim() : undefined,
        entityId,
        entityType,
      };

      if (activity) {
        // UPDATE
        updateActivityMutation.mutate({
          activityId: activity._id,
          activityData: cleanedData,
        });
      } else {
        // CREATE
        createActivityMutation.mutate({
          activityData: cleanedData,
        });
      }
    } catch (err) {
      console.error('Error on submit', err);
    }
  };

  const onError = () => {
    toast.error('Por favor corrige los errores en el formulario');
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre *</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ingresa el nombre de la actividad"
                />
                <InputGroupAddon align="inline-end">
                  {field.value?.length}/100
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Detalla la actividad"
                />
                <InputGroupAddon align="block-end">
                  {field.value?.length}/255
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex flex-col md:flex-row gap-6">
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Status).map((type) => (
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
            name="priority"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Prioridad</FieldLabel>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Define la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Priority).map((type) => (
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
        </div>

        <Controller
          control={form.control}
          name="dueDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Vencimiento</FieldLabel>
              <DatePicker date={field.value} onChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {context === 'project' && (
          <Controller
            control={form.control}
            name="assignees"
            render={({ field }) => {
              const value = field.value ?? [];

              return (
                <FieldGroup>
                  <FieldContent>
                    <FieldLabel>Encargados</FieldLabel>
                    <FieldDescription>
                      Asigna encargados a esta actividad.
                    </FieldDescription>
                  </FieldContent>
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

                    <PopoverContent className="w-full md:w-md max-h-96 overflow-y-auto p-0">
                      <Command>
                        <CommandGroup>
                          {loadingProject ? (
                            <CommandItem disabled>Cargando</CommandItem>
                          ) : members.length > 0 ? (
                            members.map((user: IUser) => {
                              const selected = value.includes(user._id);

                              return (
                                <CommandItem
                                  key={user._id}
                                  onSelect={() => {
                                    field.onChange(
                                      selected
                                        ? value.filter((v) => v !== user._id)
                                        : [...value, user._id],
                                    );
                                  }}
                                  className="flex justify-between"
                                >
                                  <ProfileInfo
                                    givenName={user.givenName}
                                    familyName={user.familyName}
                                    size="sm"
                                  />
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selected ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                </CommandItem>
                              );
                            })
                          ) : (
                            <div className="w-full select-none p-2 flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">
                                No hay miembros en este proyecto
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
        )}
      </FieldGroup>

      <div className="flex gap-3">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>

        <DialogClose asChild>
          <Button type="submit" disabled={isSubmiting}>
            {isSubmiting ? (
              <LoadingMessage />
            ) : activity ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </Button>
        </DialogClose>
      </div>
    </form>
  );
}
