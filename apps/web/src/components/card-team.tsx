import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './ui/card';
import { Button } from './ui/button';
import { BadgeVariants, ITeam, TeamsGrade } from '@repo/types';
import { User, UserPlus, Users } from 'lucide-react';
import IconSquare from './icon-square';
import AvatarRow from './avatar-row';
import { Badge } from './ui/badge';

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
      badgeVariant = BadgeVariants.GREEN;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GRAY;
      break;
  }

  const profiles = [...members, ...collaborators];
  console.log('Profiles', profiles);

  return (
    <Card className="max-w-md">
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
      <CardContent>
        <CardDescription className="h-24">{summary}</CardDescription>
        {/* <AvatarRow profiles={profiles} /> */}
      </CardContent>
      <CardFooter className="flex gap-2 justify-between items-end">
        <div>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <User size={14} />
            {collaborators.length + members.length}
          </span>
        </div>
        <CardAction>
          <Button size="sm">
            <UserPlus />
            Unirse
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
