import { IsMongoId, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRecognitionDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  projectId: string;

  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9-]+$/)
  folio: string;
}

export class UpdateRecognitionDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  projectId: string;
}
