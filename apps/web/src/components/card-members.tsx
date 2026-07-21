import { useRemoveMember } from '@/hooks/team';
import {
  ITeam,
  ITeamMembership,
  TeamMembershipRole,
  TeamMembershipStatus,
} from '@repo/types';
import { ArrowUpRight, Ellipsis, UserMinus, Users } from 'lucide-react';
import Link from 'next/link';
import IconSquare from './icon-square';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useUserProfile } from 'context/profile-provider';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { useMemo } from 'react';

export function CardMembers({
  team,
  redirect = false,
}: {
  team: ITeam;
  redirect?: boolean;
}) {
  const removeMember = useRemoveMember();

  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const owner = team.memberships.find(
    (m: ITeamMembership) => m.role === TeamMembershipRole.OWNER,
  );

  const members = useMemo(() => {
    return team.memberships.filter(
      (m: ITeamMembership) =>
        m.role === TeamMembershipRole.MEMBER &&
        m.status === TeamMembershipStatus.ACTIVE,
    );
  }, [team.memberships]);

  return (
    <Card className="w-full min-w-0 lg:max-w-96 border-neutral-400">
      <CardHeader className="flex justify-between gap-2">
        <div className="flex gap-3 items-center min-w-0">
          <IconSquare color="blue">
            <Users />
          </IconSquare>

          <CardTitle className="line-clamp-1 min-w-0">
            {team.teamName ? team.teamName : 'Integrantes del Equipo'}
          </CardTitle>
        </div>

        {redirect && (
          <Button variant="ghost" aria-label="Visitar equipo">
            <Link
              className="flex items-center"
              href={`${baseUrl}/equipos/${team._id}`}
            >
              Visitar
              <ArrowUpRight />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm">Líder del Equipo</span>
        <ProfileInfo
          size="sm"
          givenName={owner!.user.givenName}
          familyName={owner!.user.familyName}
          email={owner!.user.email}
          avatarUrl={owner!.user.avatarUrl}
        />
        <span className="text-muted-foreground text-sm">Miembros</span>
        {members.length > 0 ? (
          members?.map((m: ITeamMembership) => (
            <div key={m.user._id} className="flex justify-between group">
              <ProfileInfo
                size="sm"
                givenName={m.user.givenName}
                familyName={m.user.familyName}
                email={m.user.email}
                avatarUrl={m.user.avatarUrl}
              />

              {user._id === owner!.user._id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={removeMember.isPending}
                      onClick={() =>
                        removeMember.mutate({
                          teamId: team._id,
                          userId: m.user._id,
                        })
                      }
                    >
                      <UserMinus /> Expulsar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">No hay miembros</span>
        )}
      </CardContent>
    </Card>
  );
}
