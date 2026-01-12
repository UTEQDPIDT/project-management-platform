import { useRemoveCollaborator, useRemoveMember } from '@/hooks/team';
import { ITeam, IUser } from '@repo/types';
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

  return (
    <Card className="w-full max-w-[500px]">
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
        <span className="text-muted-foreground text-sm">Dueño</span>
        <ProfileInfo
          size="sm"
          givenName={team.owner.givenName}
          familyName={team.owner.familyName}
          email={team.owner.email}
          avatarUrl={team.owner.avatarUrl}
        />
        <span className="text-muted-foreground text-sm">Miembros</span>
        {team.members.length > 0 ? (
          team.members?.map((m: IUser) => (
            <div key={m._id} className="flex justify-between">
              <ProfileInfo
                size="sm"
                givenName={m.givenName}
                familyName={m.familyName}
                email={m.email}
                avatarUrl={m.avatarUrl}
              />

              {user._id === team.owner._id && (
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
                        removeMember.mutate({ teamId: team._id, userId: m._id })
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
        {team.collaborators.length > 0 ? (
          team.collaborators?.map((c: IUser) => (
            <div key={c._id} className="flex justify-between">
              <ProfileInfo
                size="sm"
                givenName={c.givenName}
                familyName={c.familyName}
                email={c.email}
                avatarUrl={c.avatarUrl}
              />

              {user._id === team.owner._id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Button
                      size="sm"
                      className="w-full justify-start font-normal bg-transparent hover:bg-accent"
                      variant="destructive"
                      disabled={removeCollaborator.isPending}
                      onClick={() =>
                        removeCollaborator.mutate({
                          teamId: team._id,
                          userId: c._id,
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
