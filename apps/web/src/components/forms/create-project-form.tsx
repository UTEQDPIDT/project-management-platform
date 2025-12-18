'use client';

import { teamSchema } from '@/schemas/team.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useDevelopmentLines,
  useDivisions,
  useKnowledgeAreas,
  usePndPriorities,
  useSustainableGoals,
  useThemedImpactAreas,
} from '@/hooks/catalogs';
import { useCreateTeam, useTeam, useTeamsByUser } from '@/hooks/team';

import { resolveEmails } from '@/services/user.service';

import {
  SeedCategory,
  IResolvedEmail,
  TeamsGrade,
  ImpactLevel,
  IProject,
  ITeam,
  IActivity,
} from '@repo/types';
import { Check, ChevronsUpDown, Logs, PlusIcon, XIcon } from 'lucide-react';
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
import { projectSchema } from '@/schemas/project.schema';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandGroup, CommandItem } from '../ui/command';
import { useProjectsByOwner } from '@/hooks/projects';
import { createOnBulk } from '@/services/activity.service';
import Link from 'next/link';
import { DatePicker } from '../ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { TRLForm } from './trl-assesment-form';
import { Separator } from '../ui/separator';
import { useState } from 'react';

export function CreateProjectForm() {
  const router = useRouter();

  /**
   * React Query Hooks
   */
  const { data: pndPriorities, isLoading: loadingPndPriorities } =
    usePndPriorities();
  const { data: impactAreas, isLoading: loadingImpactAreas } =
    useThemedImpactAreas();
  const { data: sustainableGoals, isLoading: loadingSustainableGoals } =
    useSustainableGoals();
  const { data: developmentLines, isLoading: loadingDevelopmentLines } =
    useDevelopmentLines();
  const { data: knowledgeAreas, isLoading: loadingKnowledgeAreas } =
    useKnowledgeAreas();
  const { data: teams, isLoading: loadingTeams } = useTeamsByUser();
  const { data: projects, isLoading: loadingProjects } = useProjectsByOwner();

  const [trlOpen, setTrlOpen] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      summary: '',
      objective: '',
      trlRating: 0,
      knowledgeAreas: [],
      impactAreas: [],
      prioritiesPND: [],
      sustainableObjectives: [],
      innovationLines: [],
      impactLevel: ImpactLevel.LOCAL,
      organization: '',
      activities: [],
      team: '',
      relatedProjects: [],
      startDate: undefined,
      endDate: undefined,
    },
  });

  const {
    fields: activities,
    append: addActivity,
    remove: removeActivity,
  } = useFieldArray({
    control: form.control,
    name: 'activities',
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    try {
      console.log('RAW DATA', data);
      //   const newActivities = await createOnBulk(data.activities);
      //   console.log('NEW ACTIVITIES', newActivities);

      const cleanedData = {
        ...data,
        organization: data.organization === '' ? undefined : data.organization,
        team: data.team === '' ? undefined : data.team,
        // activities: newActivities.map((activity: IActivity) => activity._id),
      };
      console.log('CLEANED DATA', cleanedData);

      //   TODO mutation
      //   form.reset();
      //   router.push('/user/proyectos');
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
        className="flex flex-col gap-6 md:w-2xl"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Datos Generales</CardTitle>
            <CardDescription>
              Los campos obligatorios están marcados con asterisco.
            </CardDescription>
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
                        placeholder="Ingresa el nombre del proyecto"
                      />
                      <InputGroupAddon align="inline-end">
                        {field.value?.length}/200
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
                      <FieldLabel htmlFor={field.name}>Descripción*</FieldLabel>
                      <FieldDescription>
                        Describe brevemente el propósito del proyecto.
                      </FieldDescription>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Una breve descripción del proyecto"
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
                name="objective"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Objetivo*</FieldLabel>
                      <FieldDescription>
                        Describe detalladamente el propósito principal del
                        proyecto.
                      </FieldDescription>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Detalla los objetivos del proyecto"
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
                name="organization"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Organización</FieldLabel>
                    <FieldDescription>
                      Organización asociada al proyecto
                    </FieldDescription>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. CONCYTEQ"
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
                name="trlRating"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>TRL Inicial*</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type="number"
                        disabled={true}
                      />
                      <InputGroupAddon align="inline-end">
                        <Dialog open={trlOpen} onOpenChange={setTrlOpen}>
                          <DialogTrigger asChild>
                            <InputGroupButton variant="outline">
                              Evaluar
                            </InputGroupButton>
                          </DialogTrigger>

                          <DialogContent aria-describedby="Evaluación TRL">
                            <div className="flex flex-col gap-2">
                              <DialogTitle>Evaluación TRL</DialogTitle>
                              <DialogDescription>
                                Esta encuesta evaluará la madurez del proyecto
                                en estándares establecidos por la NASA. Haz
                                Check en todas las casillas que apliquen al
                                proyecto.
                              </DialogDescription>
                            </div>
                            <Separator />
                            {/* TODO: pass Dialog state for closing */}
                            <TRLForm
                              onTRLChange={(trl) => {
                                field.onChange(trl);
                                setTrlOpen(false);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </InputGroupAddon>
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
            <CardTitle>Duración</CardTitle>
            <CardDescription>Define la duración del proyecto.</CardDescription>
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
                        Fecha de inicio*
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
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Fecha de término*
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
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto del proyecto</CardTitle>
            <CardDescription>
              Las áreas y nivel en las que impacta el proyecto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="impactLevel"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Nivel de impacto
                    </FieldLabel>
                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        id={field.name}
                        onBlur={onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ImpactLevel).map((level) => (
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
                name="knowledgeAreas"
                render={({ field }) => {
                  const value = field.value ?? []; // ✅ FIX

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>Áreas del Conocimiento</FieldLabel>
                        <FieldDescription>
                          Selecciona las áreas del conocimiento asociadas al
                          proyecto.
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
                              <span className="text-muted-foreground">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandGroup>
                              {loadingKnowledgeAreas ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : (
                                knowledgeAreas.map((area: SeedCategory) => {
                                  const selected = value.includes(area._id);

                                  return (
                                    <CommandItem
                                      key={area._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== area._id,
                                              )
                                            : [...value, area._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {area.name}
                                    </CommandItem>
                                  );
                                })
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="impactAreas"
                render={({ field }) => {
                  const value = field.value ?? [];

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>
                          Impactos temáticos transversales
                        </FieldLabel>
                        <FieldDescription>
                          Selecciona los impactos temáticos transversales que
                          apliquen al proyecto.
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
                              <span className="text-muted-foreground">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandGroup>
                              {loadingImpactAreas ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : (
                                impactAreas.map((area: SeedCategory) => {
                                  const selected = value.includes(area._id);

                                  return (
                                    <CommandItem
                                      key={area._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== area._id,
                                              )
                                            : [...value, area._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {area.name}
                                    </CommandItem>
                                  );
                                })
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="prioritiesPND"
                render={({ field }) => {
                  const value = field.value ?? [];

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>
                          Prioridades Nacionales del PND Sección SEHCITI
                        </FieldLabel>
                        <FieldDescription>
                          Selecciona las Prioridades Nacionales del PND Sección
                          SEHCITI que aplican al proyecto.
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
                              <span className="text-muted-foreground">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandGroup>
                              {loadingPndPriorities ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : (
                                pndPriorities.map((priority: SeedCategory) => {
                                  const selected = value.includes(priority._id);

                                  return (
                                    <CommandItem
                                      key={priority._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== priority._id,
                                              )
                                            : [...value, priority._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {priority.name}
                                    </CommandItem>
                                  );
                                })
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="sustainableObjectives"
                render={({ field }) => {
                  const value = field.value ?? [];

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>
                          Objetivos de Desarrollo Sustentable
                        </FieldLabel>
                        <FieldDescription>
                          Selecciona, si aplica, los objetivos de desarrollo
                          sustentable que apliquen al proyecto.
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
                              <span className="text-muted-foreground">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandGroup>
                              {loadingSustainableGoals ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : (
                                sustainableGoals.map((goal: SeedCategory) => {
                                  const selected = value.includes(goal._id);

                                  return (
                                    <CommandItem
                                      key={goal._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== goal._id,
                                              )
                                            : [...value, goal._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {goal.name}
                                    </CommandItem>
                                  );
                                })
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="innovationLines"
                render={({ field }) => {
                  const value = field.value ?? [];

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>
                          Líneas Innovadoras de Investigación Aplicada y
                          Desarrollo Tecnológico (LIIADT's){' '}
                        </FieldLabel>
                        <FieldDescription>
                          Selecciona las LIIADT's estratégicas de la UTEQ con
                          nichos tecnológicos prioritarios de desarrollo en
                          temas de Industria 4.0 con las que se relaciona el
                          proyecto.
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
                              <span className="text-muted-foreground">
                                Sin selección
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full lg:max-w-2xl max-h-96 overflow-y-auto p-0">
                          <Command>
                            <CommandGroup>
                              {loadingDevelopmentLines ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : (
                                developmentLines.map((line: SeedCategory) => {
                                  const selected = value.includes(line._id);

                                  return (
                                    <CommandItem
                                      key={line._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== line._id,
                                              )
                                            : [...value, line._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {line.name}
                                    </CommandItem>
                                  );
                                })
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FieldGroup>
                  );
                }}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividades</CardTitle>
            <CardDescription>
              El proyecto debe tener por lo menos 5 actividades clave.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="gap-4">
                {activities.map((field, index) => (
                  <Controller
                    key={field.id}
                    name={`activities.${index}.name`}
                    control={form.control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent>
                          <InputGroup>
                            <InputGroupInput
                              {...controllerField}
                              id={`activity.${index}`}
                              aria-invalid={fieldState.invalid}
                              placeholder="e.g. Investigación bibliográfica sobre los neuromitos actuales en la educación. "
                            />
                            {activities.length > 5 && (
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => removeActivity(index)}
                                  aria-label={`Eliminar actividad ${index + 1}`}
                                >
                                  <XIcon />
                                </InputGroupButton>
                              </InputGroupAddon>
                            )}
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addActivity({ name: '' })}
                >
                  Añadir Actividad
                </Button>
              </FieldGroup>
              {form.formState.errors.activities?.root && (
                <FieldError errors={[form.formState.errors.activities.root]} />
              )}
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipo y Proyectos Relacionados</CardTitle>
            <CardDescription>Estos campos son opcionales.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="team"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Equipo</FieldLabel>
                      <FieldDescription>
                        El equipo que trabajará en el proyecto.
                      </FieldDescription>
                    </FieldContent>
                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        id={field.name}
                        onBlur={onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Sin selección" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTeams ? (
                          <LoadingMessage message="Cargando equipos" />
                        ) : (
                          teams.map((team: ITeam) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.teamName}
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
                name="relatedProjects"
                render={({ field }) => {
                  const value = field.value ?? [];

                  return (
                    <FieldGroup>
                      <FieldContent>
                        <FieldLabel>Proyectos Relacionados</FieldLabel>
                        <FieldDescription>
                          Proyectos antecesores a este nuevo proyecto.
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

                        <PopoverContent className="w-full lg:max-w-2xl max-h-96 overflow-y-auto p-0">
                          <Command>
                            <CommandGroup>
                              {loadingProjects ? (
                                <CommandItem disabled>Cargando</CommandItem>
                              ) : projects.lenght > 0 ? (
                                projects.map((project: IProject) => {
                                  const selected = value.includes(project._id);

                                  return (
                                    <CommandItem
                                      key={project._id}
                                      onSelect={() => {
                                        field.onChange(
                                          selected
                                            ? value.filter(
                                                (v) => v !== project._id,
                                              )
                                            : [...value, project._id],
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
                                      {project.name}
                                    </CommandItem>
                                  );
                                })
                              ) : (
                                <div className="w-full select-none p-2 flex items-center justify-center">
                                  <span className="text-muted-foreground text-sm">
                                    No tienes otros proyectos
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
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant={'outline'} type="button" asChild>
            <Link href="/user/proyectos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={false}>
            {false ? (
              <LoadingMessage message="Creando proyecto" />
            ) : (
              'Crear proyecto'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
