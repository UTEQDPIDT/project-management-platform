import { IsMongoId, IsString, Matches, MaxLength, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { RecognitionType } from '@repo/types';

export class CreateRecognitionDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  projectId: string;

  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9-]+$/)
  folio: string;

  @IsEnum(RecognitionType)
  @IsOptional()
  recognitionType?: RecognitionType;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  customUserName?: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  customHours?: number;
}

export class UpdateRecognitionDto {
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9-]+$/)
  @IsOptional()
  folio?: string;

  @IsEnum(RecognitionType)
  @IsOptional()
  recognitionType?: RecognitionType;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  customUserName?: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  customHours?: number;
}

