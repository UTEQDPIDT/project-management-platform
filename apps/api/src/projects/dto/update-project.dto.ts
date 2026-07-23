import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endDate?: Date;
}
