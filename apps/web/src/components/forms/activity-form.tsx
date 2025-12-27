'use client';

import { IActivity, IUser, Priority, Status } from '@repo/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
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

interface Props {
  activity?: IActivity;
  projectId?: string;
}

export function ActivityForm({ activity, projectId }: Props) {
  const form = useForm({
    resolver: zodResolver(activityZodSchema),
    mode: 'onChange',
    defaultValues: {
      name: activity?.name || '',
      description: activity?.description || '',
      status: activity?.status || Status.PENDING,
      priority: activity?.priority || Priority.LOW,
      checked: activity?.checked || false,
      assignees: activity?.assignees
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
      };
      console.log('CLEAN DATA', cleanedData);

      if (activity) {
        // update mutation
      } else {
        // create mutation
      }
    } catch (err) {
      console.error('Error on submit', err);
    }
  };

  const onError = (erros: any) => {
    console.log('FORM ERRORS', erros);
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
              <FieldLabel htmlFor={field.name}>Periodo</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="assignees"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Encargados</FieldLabel>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-3">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>

        <Button>{activity ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  );
}
