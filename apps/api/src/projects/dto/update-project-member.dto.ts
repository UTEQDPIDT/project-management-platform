import { IsBoolean, IsMongoId } from 'class-validator';

export class UpdateProjectMemberDto {
  @IsMongoId()
  membershipId: string;

  @IsBoolean()
  selected: boolean;
}
