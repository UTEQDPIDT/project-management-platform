import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('events')
	getEventsDashboard(
		@Query('period') period?: 'T1' | 'T2' | 'T3',
		@Query('year') year?: string,
	) {
		const parsedYear = year ? Number(year) : undefined;

		if (year && (!Number.isFinite(parsedYear) || !Number.isInteger(parsedYear))) {
			throw new BadRequestException('year debe ser un numero entero valido');
		}

		return this.dashboardService.getEventsDashboard(period, parsedYear);
	}
}
