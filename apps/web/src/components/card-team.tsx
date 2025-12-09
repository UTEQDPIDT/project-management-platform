import { BadgeVariants, ITeam, TeamsGrade } from '@repo/types';
import { User, UserPlus, Users } from 'lucide-react';
import AvatarRow from './avatar-row';
import IconSquare from './icon-square';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function CardTeam({
  teamName,
  summary,
  division,
  grade,
  collaborators,
  members,
}: Pick<
  ITeam,
  'teamName' | 'summary' | 'division' | 'grade' | 'collaborators' | 'members'
>) {
  let badgeVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'pruple'
    | 'orange'
    | null
    | undefined;
  switch (grade) {
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
  }

  // 1. Deduplicate using user._id BEFORE mapping
  const uniqueUsers = Array.from(
    new Map([...members, ...collaborators].map((u) => [u._id, u])).values(),
  );

  // 2. Extract only the fields needed for AvatarRow
  const profiles = uniqueUsers.map((u) => ({
    givenName: u.givenName,
    familyName: u.familyName,
    avatarUrl: u.avatarUrl,
  }));

  return (
    <Card className="max-w-md gap-6">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-start">
            <IconSquare>
              <Users />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle className="line-clamp-1 leading-5">
                {teamName}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {division?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6">
            {grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 h-full">
        <CardDescription className="h-24 line-clamp-5">
          {summary}
        </CardDescription>
        <AvatarRow profiles={profiles} />
      </CardContent>
      <CardFooter className="border-t flex gap-2 justify-between items-center">
        <div>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <User size={14} />
            {uniqueUsers.length}
          </span>
        </div>
        <CardAction>
          <Button variant="outline" size="sm">
            <UserPlus />
            Unirse
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
