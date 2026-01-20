import {
  ITeam,
  ITeamMembership,
  TeamMembershipRole,
  TeamMembershipStatus,
} from '@repo/types';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import { TeamUserRequests } from './team-user-requests';
import { request } from 'http';

type TeamNotificationsProps = {
  team: ITeam;
};

export function TeamNotifications({ team }: TeamNotificationsProps) {
  const requests = team.memberships.filter(
    (m: ITeamMembership) =>
      m.role === TeamMembershipRole.MEMBER &&
      m.status === TeamMembershipStatus.PENDING,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <div className="relative">
            {requests.length > 0 && (
              <div className="rounded-full bg-red-500 aspect-square h-2 absolute top-0 right-0" />
            )}
            <Bell />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        {requests.length > 0 ? (
          <TeamUserRequests teamId={team._id} requests={requests} />
        ) : (
          <div className="px-2 py-3">
            <span className="text-muted-foreground text-sm">
              No hay notificaciones
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
