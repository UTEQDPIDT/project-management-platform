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
import { useCreateTeam, useTeam } from '@/hooks/team';

import { resolveEmails } from '@/services/user.service';

import {
  SeedCategory,
  IResolvedEmail,
  TeamsGrade,
  ImpactLevel,
} from '@repo/types';
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
import { projectSchema } from '@/schemas/project.schema';

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

  const form = useForm({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      summary: '',
      objective: '',
      trlRating: 4,
      knowledgeAreas: [],
      impactAreas: [],
      prioritiesPND: [],
      sustainableObjectives: [],
      innovationLines: [],
      impactLevel: ImpactLevel.LOCAL,
      organization: '',
      team: '',
      relatedProjects: [],
      startDate: undefined,
      endDate: undefined,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    try {
      console.log(data);

      //   const cleanedData = {
      //     ...data,
      //   };
      //   createTeamMutation.mutate(cleanedData);
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
        className="flex flex-col gap-6 lg:w-2xl"
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
                        <InputGroupButton variant="outline">
                          Evaluar
                        </InputGroupButton>
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
            <CardTitle>Áreas de Impacto e Innovación</CardTitle>
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
                      Nivel de Impacto
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
                name="impactAreas"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Área de conocimiento asociada
                    </FieldLabel>

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
            <CardTitle>Actividades</CardTitle>
            <CardDescription>
              El proyecto debe tener por lo menos 5 actividades clave.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup></FieldGroup>
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
                    <FieldLabel htmlFor={field.name}>Equipo</FieldLabel>
                    <FieldDescription>
                      El equipo que trabajará en el proyecto.
                    </FieldDescription>
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

              {/* <Controller
                control={form.control}
                name="relatedProjects"
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>División</FieldLabel>
                    <FieldDescription>
                      Proyectos antecesores o relaconados al proyecto.
                    </FieldDescription>
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
              /> */}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant={'outline'}
            type="button"
            onClick={() => form.reset()}
          >
            Restablecer
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
