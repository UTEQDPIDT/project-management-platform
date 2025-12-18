import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export function ProfileInfo({
  givenName,
  familyName,
  email,
  avatarUrl,
}: {
  givenName: string;
  familyName: string;
  email?: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <Avatar>
        <AvatarImage src={avatarUrl} alt={givenName} />
        <AvatarFallback>{givenName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium line-clamp-1">
          {givenName} {familyName}
        </span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}
