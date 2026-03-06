import { IProject, SeedCategory } from '@repo/types';
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

  const {
    name,
    startDate,
    endDate,
    trlRating,
    team,
    owner,
    organization,
    objective,
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
  } = project;

  return (
    <div className="text-sm border-b pb-4 w-full px-4">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{name}</h1>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Building size={14} /> Organización
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {organization ? (
            <span>{organization}</span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Calendar size={14} /> Periodo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {startDate && (
            <div className="flex gap-2">
              <span>
                {format(startDate, "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
              {endDate && (
                <span className="flex gap-2 items-center justify-center">
                  <MoveRight size={10} />
                  {format(endDate, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <ArrowUp10 size={14} /> Nivel de TRL
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">{trlRating}</div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Target size={14} /> Objetivo
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {objective ? objective : <span className="text-gray-400">Vacío</span>}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <MapPinned size={14} /> Nivel de impacto
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">{impactLevel}</div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <BookOpen size={14} className="shrink-0" /> Áreas de Conocimiento
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <FoldVertical size={14} className="shrink-0" /> Impactos Transversales
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Leaf size={14} className="shrink-0" /> Objetivos Sustentables
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <LandPlot size={14} className="shrink-0" />
          Prioridades PND
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <BrainCircuit size={14} className="shrink-0" />
          LIIADTs
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 h-11 items-center rounded-md">
          <Users size={14} /> Equipo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {team ? (
            <Button size="xs" asChild variant="ghost">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 h-11 items-center rounded-md">
          <Folder size={14} /> Proyectos
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {relatedProjects?.length ? (
            relatedProjects.map((p: IProject) => (
              <Button key={p._id} size="xs" asChild variant="ghost">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <UserCircle size={14} /> Creado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Calendar size={14} /> Creado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {format(createdAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <UserCircle size={14} /> Modificado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
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

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Calendar size={14} /> Modificado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {format(updatedAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>
    </div>
  );
}
