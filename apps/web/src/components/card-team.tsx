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
import { ITeam, TeamsGrade } from '@repo/types';
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
  let badgeStyle;
  switch (grade) {
    case TeamsGrade.FORMACION:
      badgeStyle = 'bg-gray-200 text-gray-800 ';
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeStyle = 'bg-green-100 text-green-800';
      break;
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <IconSquare>
              <Users />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle>{teamName}</CardTitle>
              <CardDescription className="text-xs">{division}</CardDescription>
            </div>
          </div>
          <Badge className={`${badgeStyle} h-6`}>{grade}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="h-24">{summary}</CardDescription>
        {/* <AvatarRow profiles={} /> */}
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
