'use client';

import { IProject, ProjectStatus, SeedCategory } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowUp10,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Building,
  Calendar,
  Folder,
  FoldVertical,
  LandPlot,
  Leaf,
  MapPinned,
  MoveRight,
  Percent,
  Target,
  UserCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { concatWithCommaAndDot, getBaseUrlBasedOnRole } from '@/lib/utils';
import { useUserProfile } from 'context/profile-provider';

interface ProjectInfoProps {
  project: IProject;
  progress: number;
}

export function ProjectInfo({ project, progress }: ProjectInfoProps) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const normalizeProjectStatus = (value?: string): ProjectStatus => {
    const normalizedValue = (value ?? '').trim().toUpperCase();

    if (
      normalizedValue === 'IN_PROGRESS' ||
      normalizedValue === 'EN PROGRESO' ||
      normalizedValue === 'PROGRESS'
    ) {
      return ProjectStatus.IN_PROGRESS;
    }

    if (
      normalizedValue === 'COMPLETED' ||
      normalizedValue === 'COMPLETADO'
    ) {
      return ProjectStatus.COMPLETED;
    }

    return ProjectStatus.PENDING;
  };

  const getProjectStatusLabel = (value?: string) => {
    const normalizedStatus = normalizeProjectStatus(value);

    if (normalizedStatus === ProjectStatus.PENDING) {
      if (progress >= 100) return 'Completado';
      if (progress > 0) return 'En progreso';
    }

    if (normalizedStatus === ProjectStatus.IN_PROGRESS) return 'En progreso';
    if (normalizedStatus === ProjectStatus.COMPLETED) return 'Completado';
    return 'Pendiente';
  };

  const {
    name,
    startDate,
    endDate,
    trlRating,
    team,
    owner,
    organization,
    objective,
    program,
    updatedAt,
    createdAt,
    updatedBy,
    impactLevel,
    impactAreas,
    knowledgeAreas,
    sustainableObjectives,
    prioritiesPND,
    innovationLines,
    relatedProjects,
    status,
  } = project;

  // Clase reutilizable para cada fila de datos del proyecto
  const rowClass = "flex flex-col sm:flex-row sm:items-start py-1 sm:py-0 border-b border-neutral-100 sm:border-0";
  // Clase reutilizable para el label de la izquierda
  const labelClass = "p-2 flex gap-2 text-muted-foreground w-full sm:w-40 items-center font-medium sm:font-normal rounded-md shrink-0";

  return (
    <div className="text-sm border-b pb-4 w-full px-2 sm:px-4 space-y-1">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{name}</h1>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Building size={14} /> Organización
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {organization ? (
            <span>{organization}</span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Percent size={14} /> Progreso
        </span>
        <div className="p-2 hover:bg-secondary rounded-md flex gap-2 w-full max-w-48 items-center">
          <Progress value={progress} />
          <div className="flex text-xs">
            <span>{progress}</span>
            <span>%</span>
          </div>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Target size={14} /> Estado
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          <span>{getProjectStatusLabel(status)}</span>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Periodo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {startDate && (
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
              <span>
                {format(startDate, "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
              {endDate && (
                <span className="flex gap-1 sm:gap-2 items-center text-muted-foreground flex-wrap">
                  <MoveRight size={12} className="hidden sm:inline" />
                  <span className="sm:hidden text-xs font-bold px-1">al</span>
                  {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Folder size={14} /> Programa
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {program ? (
            <span>{program.name}</span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <ArrowUp10 size={14} /> Nivel de TRL
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">{trlRating}</div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Target size={14} /> Objetivo
        </span>
        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md w-full">
          {objective ? objective : <span className="text-gray-400">Vacío</span>}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <MapPinned size={14} /> Nivel de impacto
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">{impactLevel}</div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <BookOpen size={14} className="shrink-0" /> Áreas de Conocimiento
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {knowledgeAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                knowledgeAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <FoldVertical size={14} className="shrink-0" /> Impactos Transversales
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {impactAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                impactAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Leaf size={14} className="shrink-0" /> Objetivos Sustentables
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {sustainableObjectives?.length ? (
            <span>
              {concatWithCommaAndDot(
                sustainableObjectives.map((o: SeedCategory) => o.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <LandPlot size={14} className="shrink-0" />
          Prioridades PND
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {prioritiesPND?.length ? (
            <span>
              {concatWithCommaAndDot(
                prioritiesPND.map((p: SeedCategory) => p.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <BrainCircuit size={14} className="shrink-0" />
          LIIADTs
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {innovationLines?.length ? (
            <span>
              {concatWithCommaAndDot(
                innovationLines.map((l: SeedCategory) => l.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Users size={14} /> Equipo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full flex flex-wrap">
          {team ? (
            <Button size="xs" asChild variant="ghost" className="h-auto py-1 px-2 text-left justify-start whitespace-normal">
              <Link href={`${baseUrl}/equipos/${team._id}`}>
                {team.teamName}
                <ArrowUpRight />
              </Link>
            </Button>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Folder size={14} /> Proyectos
        </span>
        {/* CORRECCIÓN AQUÍ: flex flex-wrap gap-1 */}
        <div className="p-2 hover:bg-secondary rounded-md w-full flex flex-wrap gap-1">
          {relatedProjects?.length ? (
            relatedProjects.map((p: IProject) => (
              <Button key={p._id} size="xs" asChild variant="ghost" className="h-auto py-1 px-2 text-left justify-start whitespace-normal">
                <Link href={`${baseUrl}/proyectos/${p._id}`}>
                  {p.name}
                  <ArrowUpRight />
                </Link>
              </Button>
            ))
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <UserCircle size={14} /> Creado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {owner ? (
            <ProfileInfo
              size="sm"
              givenName={owner.givenName}
              familyName={owner.familyName}
              avatarUrl={owner.avatarUrl}
            />
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Creado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {format(createdAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <UserCircle size={14} /> Modificado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {updatedBy && (
            <ProfileInfo
              size="sm"
              givenName={updatedBy.givenName}
              familyName={updatedBy.familyName}
              avatarUrl={updatedBy.avatarUrl}
            />
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Modificado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {format(updatedAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>
    </div>
  );
}