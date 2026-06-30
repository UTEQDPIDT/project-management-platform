'use client';

import { useSendJoinRequest } from '@/hooks/team';
import {
  BadgeVariants,
  ITeam,
  ITeamMembership,
  TeamMembershipRole,
  TeamMembershipStatus,
  TeamsGrade,
} from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { ArrowUpRight, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import AvatarRow from './avatar-row';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { getBaseUrlBasedOnRole } from '@/lib/utils';

type TeamCardVariant = 'default' | 'compact';
interface TeamCardProps {
  team: ITeam;
  variant?: TeamCardVariant;
  className?: string;
}

function TeamCardDefault({ team, className }: { team: ITeam; className?: string }) {
  /**
   * React Query
   */
  const sendJoinRequestMutation = useSendJoinRequest();

  /**
   * Context
   */
  const { user } = useUserProfile();

  /**
   * Get base URL
   */
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  /**
   * Extract owner, members, collaborators
   */
  const owner = team?.memberships.find(
    (m: ITeamMembership) => m.role === TeamMembershipRole.OWNER,
  );

  const members = team?.memberships.filter(
    (m: ITeamMembership) =>
      m.role === TeamMembershipRole.MEMBER &&
      m.status === TeamMembershipStatus.ACTIVE,
  );

  const collaborators = team?.memberships.filter(
    (m: ITeamMembership) =>
      m.role === TeamMembershipRole.COLLABORATOR &&
      m.status === TeamMembershipStatus.ACTIVE,
  );

  /**
   * Conditionally render buttons
   */
  const currentUserId = user._id;
  const isOwner = owner?.user._id === currentUserId;
  const isMember = members?.some(
    (m: ITeamMembership) => m.user._id === currentUserId,
  );
  const isCollaborator = collaborators?.some(
    (c: ITeamMembership) => c.user._id === currentUserId,
  );
  const hasRequested = team.memberships?.some(
    (c: ITeamMembership) => c.user._id === currentUserId,
  );

  const renderActionButton = () => {
    if (isOwner || isMember || isCollaborator) {
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${baseUrl}/equipos/${team._id}`}>
            <span className="flex gap-1 items-center">
              Visitar
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
      );
    }
    if (!hasRequested) {
      return (
        <Button
          onClick={() => sendJoinRequestMutation.mutate(team._id)}
          variant="outline"
          size="sm"
          disabled={sendJoinRequestMutation.isPending}
        >
          {sendJoinRequestMutation.isPending ? (
            <LoadingMessage message="Enviando" />
          ) : (
            <span className="flex gap-1 items-center">
              <UserPlus className="h-4 w-4" />
              Unirse
            </span>
          )}
        </Button>
      );
    }
    return (
      <Button variant="outline" size="sm" disabled>
        Solicitud enviada
      </Button>
    );
  };

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
  switch (team.grade) {
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

  /**
   * Team member count
   */
  const uniqueUsers = Array.from(
    new Map(
      [...members, ...collaborators].map((u) => [u.user._id, u]),
    ).values(),
  );

  const profiles = uniqueUsers.map((u) => ({
    givenName: u.user.givenName,
    familyName: u.user.familyName,
    avatarUrl: u.user.avatarUrl,
  }));

  if (owner) {
    profiles.push({
      givenName: owner.user.givenName,
      familyName: owner.user.familyName,
      avatarUrl: owner.user.avatarUrl,
    });
  }

  return (
    /* Eliminado min-w-96 e inyectado gap adaptable para pantallas muy pequeñas */
    <Card className={`w-full flex flex-col gap-2 md:gap-4 border-neutral-400 ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-2 items-start min-w-0">
            <IconSquare color="blue">
              <Users />
            </IconSquare>
            <div className="flex flex-col gap-1 min-w-0">
              <CardTitle className="line-clamp-1 leading-5">
                {team.teamName}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {team.division?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6 shrink-0 text-center whitespace-nowrap text-[10px] sm:text-xs">
            {team.grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 h-full min-h-0">
        <CardDescription className="h-28 line-clamp-5 overflow-hidden">
          {team.summary}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between items-center mt-auto flex-wrap sm:flex-nowrap">
        <div className="shrink-0">
          <AvatarRow profiles={profiles} />
        </div>
        <CardAction className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
          {renderActionButton()}
        </CardAction>
      </CardFooter>
    </Card>
  );
}

function TeamCardCompact({ team, className }: { team: ITeam; className?: string }) {
  /**
   * Context
   */
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const owner = team?.memberships.find(
    (m: ITeamMembership) => m.role === TeamMembershipRole.OWNER,
  );
  const members = team?.memberships.filter(
    (m: ITeamMembership) =>
      m.role === TeamMembershipRole.MEMBER &&
      m.status === TeamMembershipStatus.ACTIVE,
  );
  const collaborators = team?.memberships.filter(
    (m: ITeamMembership) =>
      m.role === TeamMembershipRole.COLLABORATOR &&
      m.status === TeamMembershipStatus.ACTIVE,
  );

  const uniqueUsers = Array.from(
    new Map(
      [...members, ...collaborators].map((u) => [u.user._id, u]),
    ).values(),
  );
  const profiles = uniqueUsers.map((u) => ({
    givenName: u.user.givenName,
    familyName: u.user.familyName,
    avatarUrl: u.user.avatarUrl,
  }));
  if (owner) {
    profiles.push({
      givenName: owner.user.givenName,
      familyName: owner.user.familyName,
      avatarUrl: owner.user.avatarUrl,
    });
  }

  return (
    /* Eliminado max-w-52 y shrink-0 estáticos tanto del Link como de la Card para heredar el ancho elástico de las columnas del CSS Grid global */
    <Link
      href={`${baseUrl}/equipos/${team._id}`}
      className={`w-full block h-36 ${className}`}
    >
      <Card className={`hover:shadow-xl w-full h-36 flex flex-col justify-between transition-shadow duration-200 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center gap-2">
            <CardTitle className="line-clamp-2 leading-5 text-sm sm:text-base min-w-0">
              {team.teamName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-0"></CardContent>
        <CardFooter className="pt-2">
          <AvatarRow profiles={profiles} />
        </CardFooter>
      </Card>
    </Link>
  );
}

export function TeamCard({ team, variant = 'default', className }: TeamCardProps) {
  if (variant === 'compact') {
    return <TeamCardCompact team={team} className={className} />;
  }
  return <TeamCardDefault team={team} className={className} />;
}