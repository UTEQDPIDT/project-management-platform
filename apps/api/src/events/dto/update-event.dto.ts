import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endDate?: Date;
}
