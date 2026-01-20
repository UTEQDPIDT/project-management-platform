import { UserType } from '@repo/types';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export function ProfileInfo({
  givenName,
  familyName,
  email,
  avatarUrl,
  userType,
  size = 'default',
  className,
}: {
  givenName: string;
  familyName: string;
  email?: string;
  avatarUrl?: string;
  userType?: UserType;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-left text-sm">
      <Avatar size={size} className={className}>
        <AvatarImage src={avatarUrl} alt={givenName} />
        <AvatarFallback>{givenName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium line-clamp-1">
          {givenName} {familyName}
        </span>
        {email && (
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        )}
      </div>
      {userType && (
        <span className="truncate text-xs text-muted-foreground">
          {userType}
        </span>
      )}
    </div>
  );
}
