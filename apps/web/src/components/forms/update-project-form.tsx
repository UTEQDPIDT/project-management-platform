'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useDevelopmentLines,
  useKnowledgeAreas,
  usePndPriorities,
  useSustainableGoals,
  useThemedImpactAreas,
} from '@/hooks/catalogs';
import { useTeamsByUser } from '@/hooks/team';

import { useProjectsByOwner, useUpdateProject } from '@/hooks/projects';
import { updateProjectSchema } from '@/schemas/update-project.schema';
import {
  ImpactLevel,
  IProject,
  ITeam,
  SeedCategory,
  UserRole,
} from '@repo/types';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import LoadingMessage from '../loading-message';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
  InputGroupButton,
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
import { Separator } from '../ui/separator';
import { TRLForm } from './trl-assesment-form';
import { userProfile } from 'context/profile-provider';
import { toast } from 'sonner';

type UpdateProjectFormProps = {
  project: IProject;
};

export function UpdateProjectForm({ project }: UpdateProjectFormProps) {
  const router = useRouter();
  const { user } = userProfile();
  const baseUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  /**
   * React Query Hooks
   */
  const { data: pndPrioritiesSeeds, isLoading: loadingPndPriorities } =
    usePndPriorities();
  const { data: impactAreasSeeds, isLoading: loadingImpactAreas } =
    useThemedImpactAreas();
  const { data: sustainableGoalsSeeds, isLoading: loadingSustainableGoals } =
    useSustainableGoals();
  const { data: developmentLinesSeeds, isLoading: loadingDevelopmentLines } =
    useDevelopmentLines();
  const { data: knowledgeAreasSeeds, isLoading: loadingKnowledgeAreas } =
    useKnowledgeAreas();
  const { data: teams, isLoading: loadingTeams } = useTeamsByUser();
  const { data: projects, isLoading: loadingProjects } = useProjectsByOwner();

  const updateProject = useUpdateProject();

  const [trlOpen, setTrlOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (loadingProjects || !projects) return [];
    return projects.filter((p: IProject) => p._id !== project._id);
  }, [projects, project._id, loadingProjects]);

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: project?.name ? project.name : '',
      objective: project?.objective ? project.objective : '',
      trlRating: project?.trlRating ? project.trlRating : 3,
      knowledgeAreas: project?.knowledgeAreas
        ? project.knowledgeAreas.map((k) => k?._id).filter(Boolean)
        : [],
      impactAreas: project?.impactAreas
        ? project.impactAreas.map((a) => a?._id).filter(Boolean)
        : [],
      prioritiesPND: project?.prioritiesPND
        ? project.prioritiesPND.map((p) => p?._id).filter(Boolean)
        : [],
      sustainableObjectives: project?.sustainableObjectives
        ? project.sustainableObjectives.map((o) => o?._id).filter(Boolean)
        : [],
      innovationLines: project?.innovationLines
        ? project.innovationLines.map((l) => l?._id).filter(Boolean)
        : [],
      impactLevel: project?.impactLevel
        ? project.impactLevel
        : ImpactLevel.LOCAL,
      organization: project?.organization ? project.organization : '',
      team: project?.team && project.team._id ? project.team._id : '',
      relatedProjects: project?.relatedProjects
        ? project.relatedProjects.map((p) => p?._id).filter(Boolean)
        : [],
      startDate: project?.startDate ? new Date(project.startDate) : undefined,
      endDate: project?.endDate ? new Date(project.endDate) : undefined,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<typeof updateProjectSchema>) => {
    try {
      const cleanedData = {
        ...data,
        organization: data.organization === '' ? undefined : data.organization,
        team: data.team === '' ? undefined : data.team,
      };
      console.log(cleanedData);

      updateProject.mutate({
        projectId: project._id,
        projectData: cleanedData,
      });
      router.push(`${baseUrl}/proyectos/${project._id}`);
    } catch (err) {
      console.error('Error cleaning data', err);
    }
  };

  const onError = () => {
    toast.error('Por favor corrige los errores en el formulario');
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
                          <DialogTrigger className="h-6 gap-1 px-2" asChild>
                            <InputGroupButton>Evaluar</InputGroupButton>
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
                                knowledgeAreasSeeds.map(
                                  (area: SeedCategory) => {
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
                                        className="flex justify-between"
                                      >
                                        {area.name}
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            selected
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                      </CommandItem>
                                    );
                                  },
                                )
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
                                impactAreasSeeds.map((area: SeedCategory) => {
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
                                      className="flex justify-between"
                                    >
                                      {area.name}
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selected ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      />
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
                                pndPrioritiesSeeds.map(
                                  (priority: SeedCategory) => {
                                    const selected = value.includes(
                                      priority._id,
                                    );

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
                                        className="flex justify-between"
                                      >
                                        {priority.name}
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            selected
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                      </CommandItem>
                                    );
                                  },
                                )
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
                                sustainableGoalsSeeds.map(
                                  (goal: SeedCategory) => {
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
                                        className="flex justify-between"
                                      >
                                        {goal.name}
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            selected
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                      </CommandItem>
                                    );
                                  },
                                )
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
                          Desarrollo Tecnológico (LIIADT&apos;s){' '}
                        </FieldLabel>
                        <FieldDescription>
                          Selecciona las LIIADT&apos;s estratégicas de la UTEQ
                          con nichos tecnológicos prioritarios de desarrollo en
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
                                developmentLinesSeeds.map(
                                  (line: SeedCategory) => {
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
                                        className="flex justify-between"
                                      >
                                        {line.name}
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            selected
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                      </CommandItem>
                                    );
                                  },
                                )
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
                        ) : teams.length > 0 ? (
                          teams.map((team: ITeam) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.teamName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="w-full select-none p-2 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">
                              No estás en ningún equipo
                            </span>
                          </div>
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

                        <PopoverContent className="w-full md:w-xl max-h-96 overflow-y-auto p-0">
                          <Command>
                            <CommandGroup>
                              {loadingProjects ? (
                                <CommandItem disabled>
                                  <LoadingMessage message="Cargando proyectos" />
                                </CommandItem>
                              ) : filteredProjects.length > 0 ? (
                                filteredProjects.map((project: IProject) => {
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
            <Link href={`${baseUrl}/proyectos/${project._id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={updateProject.isPending}>
            {updateProject.isPending ? (
              <LoadingMessage message="Actualizando" />
            ) : (
              'Actualizar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
