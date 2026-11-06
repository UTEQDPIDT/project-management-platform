import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { IsNotBefore } from '../../common/validators/is-not-before.validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@IsNotBefore('startDate', {
		message: 'La fecha de término no puede ser anterior a la fecha de inicio',
	})
	endDate?: Date;
}
