import { useAcceptRequest, useRejectRequest } from '@/hooks/team';
import { ITeamMembership } from '@repo/types';
import React from 'react';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';

export function TeamUserRequests({
  teamId,
  requests,
}: {
  teamId: string;
  requests: ITeamMembership[];
}) {
  const acceptRequestMutation = useAcceptRequest();
  const rejectRequestMutation = useRejectRequest();

  return (
    <div className="flex flex-col px-2 pb-3 gap-3 overflow-y-auto max-h-96 snap-y">
      <span className="text-muted-foreground text-xs snap-start pt-4">
        {requests.length ? 'Solicitudes de acceso' : 'No hay solicitudes'}
      </span>
      {requests?.length &&
        requests.map((m: ITeamMembership) => (
          <div key={m._id} className="flex flex-col snap-start">
            <div className="flex justify-between gap-4 items-center">
              <ProfileInfo
                size="sm"
                givenName={m.user.givenName}
                familyName={m.user.familyName}
                email={m.user.email}
                avatarUrl={m.user.avatarUrl}
              />
              <div className="flex gap-2">
                <Button
                  disabled={rejectRequestMutation.isPending}
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    rejectRequestMutation.mutate({
                      teamId: teamId,
                      userId: m.user._id,
                    })
                  }
                >
                  Rechazar
                </Button>
                <Button
                  disabled={acceptRequestMutation.isPending}
                  size="xs"
                  onClick={() =>
                    acceptRequestMutation.mutate({
                      teamId: teamId,
                      userId: m.user._id,
                    })
                  }
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
