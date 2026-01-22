import { IUser } from '@repo/types';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface AvatarRowProps {
  profiles: Pick<IUser, 'givenName' | 'familyName' | 'avatarUrl'>[];
}

export default function AvatarRow({ profiles }: AvatarRowProps) {
  const maxVisible = 3;
  const visibleProfiles = profiles.slice(0, maxVisible);
  const extraCount = profiles.length - maxVisible;

  return (
    <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
      {visibleProfiles.map((p, index) => (
        <Avatar size="sm" key={index}>
          <AvatarImage src={p.avatarUrl} alt={p.givenName} />
          <AvatarFallback>
            {p.givenName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}

      {/* Show "+N" only if extra profiles exist */}
      {extraCount > 0 && (
        <Avatar size="sm" className="text-[10px]">
          <AvatarFallback>+{extraCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
