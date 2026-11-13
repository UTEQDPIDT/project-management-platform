import { ArrayNotEmpty, IsArray, IsMongoId, IsString } from 'class-validator';

export class CheckProjectFileNamesDto {
  @IsMongoId()
  projectId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  names: string[];
}
