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
}

function TeamCardDefault({ team }: { team: ITeam }) {
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
              <ArrowUpRight />
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
              <UserPlus />
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
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CA_EN_FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CA_CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CA_EN_CONSOLIDACION:
      badgeVariant = BadgeVariants.ORANGE;
      break;
  }

  /**
   * Team member count
   */
  // 1. Deduplicate using user._id BEFORE mapping
  const uniqueUsers = Array.from(
    new Map(
      [...members, ...collaborators].map((u) => [u.user._id, u]),
    ).values(),
  );

  // 2. Extract only the fields needed for AvatarRow
  const profiles = uniqueUsers.map((u) => ({
    givenName: u.user.givenName,
    familyName: u.user.familyName,
    avatarUrl: u.user.avatarUrl,
  }));

  profiles.push({
    givenName: owner!.user.givenName,
    familyName: owner!.user.familyName,
    avatarUrl: owner!.user.avatarUrl,
  });

  return (
    <Card className="w-full gap-4 min-w-96">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-start">
            <IconSquare color="blue">
              <Users />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle className="line-clamp-1 leading-5">
                {team.teamName}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {team.division?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6">
            {team.grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 h-full">
        <CardDescription className="h-28 line-clamp-5">
          {team.summary}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between items-center">
        <div>
          <AvatarRow profiles={profiles} />
        </div>
        <CardAction>{renderActionButton()}</CardAction>
      </CardFooter>
    </Card>
  );
}

function TeamCardCompact({ team }: { team: ITeam }) {
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
  // Deduplicate users for AvatarRow
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
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CA_EN_FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CA_CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CA_EN_CONSOLIDACION:
      badgeVariant = BadgeVariants.ORANGE;
      break;
  }
  return (
    <Link
      href={`${baseUrl}/equipos/${team._id}`}
      className="w-full max-w-52 shrink-0 h-36"
    >
      <Card className="hover:shadow-xl w-full max-w-52 shrink-0 h-36">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="line-clamp-1 leading-5">
              {team.teamName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter>
          <AvatarRow profiles={profiles} />
        </CardFooter>
      </Card>
    </Link>
  );
}

export function TeamCard({ team, variant = 'default' }: TeamCardProps) {
  if (variant === 'compact') {
    return <TeamCardCompact team={team} />;
  }
  return <TeamCardDefault team={team} />;
}
