import { useSendJoinRequest } from '@/hooks/team';
import { BadgeVariants, ITeam, TeamsGrade } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { ArrowUpRight, User, UserPlus, Users } from 'lucide-react';
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

export default function TeamCard({
  _id: teamId,
  teamName,
  summary,
  division,
  grade,
  collaborators,
  members,
  owner,
  userRequests,
}: Pick<
  ITeam,
  | '_id'
  | 'teamName'
  | 'summary'
  | 'division'
  | 'grade'
  | 'collaborators'
  | 'members'
  | 'owner'
  | 'userRequests'
>) {
  /**
   * React Query
   */
  const sendJoinRequestMutation = useSendJoinRequest();

  /**
   * Context
   */
  const { user } = userProfile();

  /**
   * Conditionally render buttons
   */
  const currentUserId = user._id;
  const isOwner = owner?._id === currentUserId;
  const isMember = members.some((m) => m._id === currentUserId);
  const isCollaborator = collaborators.some((c) => c._id === currentUserId);
  const hasRequested = userRequests.some((c) => c._id === currentUserId);

  const renderActionButton = () => {
    if (isOwner || isMember || isCollaborator) {
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/user/equipos/${teamId}`}>
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
          onClick={() => sendJoinRequestMutation.mutate(teamId)}
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
    | 'pruple'
    | 'orange'
    | null
    | undefined;
  switch (grade) {
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
  }

  /**
   * Team member count
   */
  // 1. Deduplicate using user._id BEFORE mapping
  const uniqueUsers = Array.from(
    new Map([...members, ...collaborators].map((u) => [u._id, u])).values(),
  );

  // 2. Extract only the fields needed for AvatarRow
  const profiles = uniqueUsers.map((u) => ({
    givenName: u.givenName,
    familyName: u.familyName,
    avatarUrl: u.avatarUrl,
  }));

  profiles.push({
    givenName: owner.givenName,
    familyName: owner.familyName,
    avatarUrl: owner.avatarUrl,
  });

  return (
    <Card className="w-full gap-4 min-w-96">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-start">
            <IconSquare className="bg-blue-50 text-blue-700">
              <Users />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle className="line-clamp-1 leading-5">
                {teamName}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {division?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6">
            {grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 h-full">
        <CardDescription className="h-24 line-clamp-5">
          {summary}
        </CardDescription>
        <AvatarRow profiles={profiles} />
      </CardContent>
      <CardFooter className="flex border-t gap-2 justify-between items-center">
        <div>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <User size={14} />
            {profiles.length}
          </span>
        </div>
        <CardAction>{renderActionButton()}</CardAction>
      </CardFooter>
    </Card>
  );
}
