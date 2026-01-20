import { useRemoveCollaborator, useRemoveMember } from '@/hooks/team';
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
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { userProfile } from 'context/profile-provider';
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
  const removeCollaborator = useRemoveCollaborator();

  const { user } = userProfile();
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

  const collaborators = useMemo(() => {
    return team.memberships.filter(
      (m: ITeamMembership) =>
        m.role === TeamMembershipRole.COLLABORATOR &&
        m.status === TeamMembershipStatus.ACTIVE,
    );
  }, [team.memberships]);

  return (
    <Card className="w-full lg:max-w-96">
      <CardHeader className="flex justify-between">
        <div className="flex gap-3 items-center">
          <IconSquare color="blue">
            <Users />
          </IconSquare>

          <CardTitle>
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
        <span className="text-muted-foreground text-sm">Proprietario</span>
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
            <div key={m.user._id} className="flex justify-between">
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
                    <Button size="icon-sm" variant="ghost">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Button
                      size="sm"
                      className="w-full justify-start font-normal hover:text-destructive-foreground"
                      variant="ghost"
                      disabled={removeMember.isPending}
                      onClick={() =>
                        removeMember.mutate({
                          teamId: team._id,
                          userId: m.user._id,
                        })
                      }
                    >
                      <UserMinus /> Expulsar
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">No hay miembros</span>
        )}
        <span className="text-muted-foreground text-sm">Colaboradores</span>
        {collaborators.length > 0 ? (
          collaborators?.map((c: ITeamMembership) => (
            <div key={c.user._id} className="flex justify-between">
              <ProfileInfo
                size="sm"
                givenName={c.user.givenName}
                familyName={c.user.familyName}
                email={c.user.email}
                avatarUrl={c.user.avatarUrl}
              />

              {user._id === owner!.user._id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Button
                      size="sm"
                      className="w-full justify-start font-normal bg-transparent hover:text-destructive-foreground"
                      variant="ghost"
                      disabled={removeCollaborator.isPending}
                      onClick={() =>
                        removeCollaborator.mutate({
                          teamId: team._id,
                          userId: c.user._id,
                        })
                      }
                    >
                      <UserMinus /> Expulsar
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">
            No hay colaboradores
          </span>
        )}
      </CardContent>
    </Card>
  );
}
