import { BadgeVariants, ITeam, ITeamMembership, TeamsGrade } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BadgeCheck,
  Calendar,
  GraduationCap,
  HatGlasses,
  Target,
  UserCircle,
} from 'lucide-react';
import { ProfileInfo } from './profile-info';
import { Badge } from './ui/badge';

interface TeamInfoProps {
  team: ITeam;
}

export function TeamInfo({ team }: TeamInfoProps) {
  const {
    teamName,
    grade,
    division,
    summary,
    createdAt,
    updatedAt,
    isPrivate,
    memberships = [],
  } = team;

  // Find owner from memberships
  const ownerMembership = memberships.find(
    (m: ITeamMembership) => m && m.role === 'OWNER' && m.user,
  );
  const owner = ownerMembership?.user;

  let badgeVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'purple'
    | 'orange'
    | null
    | undefined;
  switch (team?.grade) {
    case TeamsGrade.CA_EN_FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CA_CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CA_EN_CONSOLIDACION:
      badgeVariant = BadgeVariants.ORANGE;
      break;
    case TeamsGrade.GRUPO_DE_INVESTIGACION:
      badgeVariant = BadgeVariants.PURPLE;
      break;
  }

  const rowClass =
    'flex flex-col sm:flex-row sm:items-start py-1 sm:py-0 border-b border-neutral-100 sm:border-0';
  const labelClass =
    'p-2 flex gap-2 text-muted-foreground w-full sm:w-40 items-center font-medium sm:font-normal rounded-md shrink-0';

  return (
    <div className="text-sm border-b pb-4 w-full px-2 sm:px-4 space-y-1">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{teamName}</h1>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <BadgeCheck size={14} /> Grado
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md w-full">
          <Badge variant={badgeVariant}>{grade}</Badge>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <GraduationCap size={14} /> División
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md w-full">
          {division ? (
            division.name
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Target size={14} /> Propósito
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md w-full">
          {summary ? summary : <span className="text-gray-400">Vacío</span>}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <HatGlasses size={14} /> Estado
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          <Badge variant={isPrivate ? 'purple' : 'blue'}>
            {isPrivate ? 'Privado' : 'Público'}
          </Badge>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <UserCircle size={14} /> Creado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {owner && typeof owner === 'object' && owner.givenName ? (
            <ProfileInfo
              size="sm"
              givenName={owner.givenName}
              familyName={owner.familyName || ''}
              avatarUrl={owner.avatarUrl || ''}
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
