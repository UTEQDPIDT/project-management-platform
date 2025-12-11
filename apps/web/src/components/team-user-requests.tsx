import { useAcceptRequest, useRejectRequest } from '@/hooks/team';
import { IUser } from '@repo/types';
import React from 'react';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';

export function TeamUserRequests({
  teamId,
  request,
}: {
  teamId: string;
  request: IUser[];
}) {
  const acceptRequestMutation = useAcceptRequest();
  const rejectRequestMutation = useRejectRequest();

  return (
    <div className="flex flex-col px-2 pb-3 gap-3 overflow-y-auto max-h-96 snap-y">
      <span className="text-muted-foreground text-xs snap-start pt-4">
        Solicitudes de acceso
      </span>
      {request.map((user: IUser) => (
        <div key={user._id} className="flex flex-col snap-start">
          <div className="flex justify-between gap-4 items-center">
            <ProfileInfo
              givenName={user.givenName}
              familyName={user.familyName}
              email={user.email}
              avatarUrl={user.avatarUrl}
            />
            <div className="flex gap-2">
              <Button
                disabled={rejectRequestMutation.isPending}
                size="sm"
                variant="outline"
                onClick={() =>
                  rejectRequestMutation.mutate({
                    teamId: teamId,
                    userId: user._id,
                  })
                }
              >
                Rechazar
              </Button>
              <Button
                disabled={acceptRequestMutation.isPending}
                size="sm"
                onClick={() =>
                  acceptRequestMutation.mutate({
                    teamId: teamId,
                    userId: user._id,
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
