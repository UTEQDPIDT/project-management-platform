'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRouter } from 'next/navigation';

import { useCreateEvent } from '@/hooks/events';
import { useUpdateEvent } from '@/hooks/events/use-update-event';
import { useGetAllUsers } from '@/hooks/user';
import { eventSchema } from '@/schemas/event.schema';
import { EventType, IEvent, IUser } from '@repo/types';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
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
import { Command, CommandGroup, CommandItem } from '../ui/command';
import { DatePicker } from '../ui/date-picker';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

interface EventFormProps {
  event?: IEvent;
}

export default function EventForm({ event }: EventFormProps) {
  /**
   * TANSTACK HOOKS
   */
  const { data: users, isLoading: loadingUsers } = useGetAllUsers();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const router = useRouter();

  const renderButton = (event: IEvent | undefined) => {
    if (event) {
      return (
        <Button type="submit" disabled={updateEvent.isPending}>
          {updateEvent.isPending ? (
            <LoadingMessage message="Actualizando evento" />
          ) : (
            'Actualizar evento'
          )}
        </Button>
      );
    } else {
      return (
        <Button type="submit" disabled={createEvent.isPending}>
          {createEvent.isPending ? (
            <LoadingMessage message="Creando evento" />
          ) : (
            'Crear evento'
          )}
        </Button>
      );
    }
  };

  const form = useForm({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      name: event?.name || '',
      summary: event?.summary || '',
      type: event?.type || EventType.INTERNO,
      location:
        event?.location || EventType.INTERNO
          ? 'Av. Pie de la Cuesta 2501, Nacional, 76148 Santiago de Querétaro, Qro.'
          : '',
      organization: event?.organization || EventType.INTERNO ? 'UTEQ' : '',
      startDate: event?.startDate ? new Date(event.startDate) : undefined,
      endDate: event?.endDate ? new Date(event.endDate) : undefined,
      isPrivate: event?.isPrivate || false,
      participants: event?.participants
        ? event.participants.map((p: IUser) => p._id)
        : [],
    },
  });

  /**
   * HANDLERS
   */
  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      const cleanedData = {
        ...data,
        organization: data.organization === '' ? undefined : data.organization,
      };

      if (event) {
        updateEvent.mutate({ eventId: event._id, eventData: cleanedData });
        router.push(`/admin/eventos/${event._id}`);
      } else {
        createEvent.mutate(cleanedData);
        router.push('/admin/eventos');
      }
    } catch (err) {
      console.error('Error cleaning data', err);
    }
  };

  const onError = (errors: any) => {
    console.log('FORM ERRORS', errors);
  };

  return (
    <form
      className="flex flex-col gap-6 md:w-2xl"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <Card>
        <CardHeader>
          <CardTitle>Datos generales del evento</CardTitle>
        </CardHeader>

        <CardContent>
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
                      placeholder="Ingresa el nombre del evento"
                    />
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
                  <FieldLabel htmlFor={field.name}>Descripción *</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. La Universidad Tecnológica de Querétaro (UTEQ) y el Centro de Ingeniería y Desarrollo Industrial (CIDESI) se enorgullecen en presentar el 4to. Congreso Internacional de Manufactura Inteligente, Mecatrónica y Elementos Tecnológicos de la Industria 4.0. donde..."
                    />
                    <InputGroupAddon align="block-end">
                      {field.value?.length}/500
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
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tipo de evento</FieldLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EventType).map((type) => (
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
              name="location"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Ubicación *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ingresa la ubicación del evento"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="organization"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organización encargada del evento
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ingresa el nombre de la organización"
                    />
                  </InputGroup>
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
          <CardTitle>Fechas</CardTitle>
          <CardDescription>
            Define las fechas del evento (la fecha de término no es
            obligatoria).
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <div className="flex gap-6 flex-col md:flex-row">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de inicio *
                    </FieldLabel>
                    <DatePicker date={field.value} onChange={field.onChange} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de término
                    </FieldLabel>
                    <DatePicker date={field.value} onChange={field.onChange} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participación</CardTitle>
          <CardDescription>Invita a participar en el evento.</CardDescription>
        </CardHeader>

        <CardContent>
          <Controller
            control={form.control}
            name="participants"
            render={({ field }) => {
              const value = field.value ?? [];

              return (
                <FieldGroup>
                  <FieldContent>
                    <FieldLabel>Asistentes</FieldLabel>
                    <FieldDescription>
                      Quienes participan en el evento.
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

                    <PopoverContent className="w-full md:w-xl max-h-96 overflow-y-auto p-0">
                      <Command>
                        <CommandGroup>
                          {loadingUsers ? (
                            <CommandItem disabled>
                              <LoadingMessage />
                            </CommandItem>
                          ) : users.length > 0 ? (
                            users.map((user: IUser) => {
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
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selected ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />

                                  <ProfileInfo
                                    givenName={user.givenName}
                                    familyName={user.familyName}
                                    avatarUrl={user.avatarUrl}
                                    size="sm"
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
                    <FieldLabel htmlFor={field.name}>Evento Privado</FieldLabel>
                    <FieldDescription>
                      Al hacer el evento privado, los asistentes solo podrán
                      participar siendo invitados.
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
          <Link href="/admin/eventos">Cancelar</Link>
        </Button>
        {renderButton(event)}
      </div>
    </form>
  );
}
