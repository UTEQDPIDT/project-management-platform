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
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
  }

  return (
    <div className="text-sm border-b pb-4 w-full px-4">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{teamName}</h1>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <BadgeCheck size={14} /> Grado
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          <Badge variant={badgeVariant}>{grade}</Badge>
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <GraduationCap size={14} /> División
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {division ? (
            division.name
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Target size={14} /> Propósito
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {summary ? summary : <span className="text-gray-400">Vacío</span>}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <HatGlasses size={14} /> Estado
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          <Badge variant={isPrivate ? 'purple' : 'blue'}>
            {isPrivate ? 'Privado' : 'Público'}
          </Badge>
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <UserCircle size={14} /> Creado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {owner && typeof owner === 'object' && owner.givenName ? (
            <ProfileInfo
              size="sm"
              givenName={owner.givenName}
              familyName={owner.familyName || ''}
              email={owner.email || ''}
              avatarUrl={owner.avatarUrl || ''}
            />
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
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
