import { useRemoveCollaborator, useRemoveMember } from '@/hooks/team';
import { Division, IUser } from '@repo/types';
import { Ellipsis, ExternalLink, UserMinus, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import IconSquare from './icon-square';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function CardMembers({
  teamId,
  name,
  division,
  owner,
  members,
  collaborators,
  redirect = false,
}: {
  teamId: string;
  name?: string;
  division?: Division;
  owner: IUser;
  members?: IUser[];
  collaborators?: IUser[];
  redirect?: boolean;
}) {
  const removeMember = useRemoveMember();
  const removeCollaborator = useRemoveCollaborator();

  return (
    <Card className="max-w-[500px]">
      <CardHeader className="flex justify-between">
        <div className="flex gap-3">
          <IconSquare>
            <Users />
          </IconSquare>
          <div className="flex flex-col gap-1">
            <CardTitle>{name ? name : 'Integrantes del Equipo'}</CardTitle>
            <CardDescription>
              {division ? division.name : 'Quienes componen tu equipo'}
            </CardDescription>
          </div>
        </div>

        {redirect && (
          <Button variant="link" title="Visitar">
            <Link href={`/user/equipos/${teamId}`}>
              <ExternalLink />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm">Dueño</span>
        <ProfileInfo
          givenName={owner.givenName}
          familyName={owner.familyName}
          email={owner.email}
          avatarUrl={owner.avatarUrl}
        />
        <span className="text-muted-foreground text-sm">Miembros</span>
        {members?.map((m: IUser) => (
          <div key={m._id} className="flex justify-between">
            <ProfileInfo
              givenName={m.givenName}
              familyName={m.familyName}
              email={m.email}
              avatarUrl={m.avatarUrl}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Button
                  size="sm"
                  className="w-full justify-start font-normal"
                  variant="destructive"
                  disabled={removeMember.isPending}
                  onClick={() => removeMember.mutate({ teamId, userId: m._id })}
                >
                  <UserMinus /> Expulsar
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <span className="text-muted-foreground text-sm">Colaboradores</span>
        {collaborators?.map((c: IUser) => (
          <div key={c._id} className="flex justify-between">
            <ProfileInfo
              givenName={c.givenName}
              familyName={c.familyName}
              email={c.email}
              avatarUrl={c.avatarUrl}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Button
                  size="sm"
                  className="w-full justify-start font-normal"
                  variant="destructive"
                  disabled={removeCollaborator.isPending}
                  onClick={() =>
                    removeCollaborator.mutate({ teamId, userId: c._id })
                  }
                >
                  <UserMinus /> Expulsar
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
