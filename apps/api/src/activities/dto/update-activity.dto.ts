import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { CreateActivityDto } from './create-activity.dto';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	dueDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	dueDateEnd?: Date;
}
