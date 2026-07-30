import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardPeriod } from '@repo/types';

@Controller('dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('events')
	getEventsDashboard(
		@Query('period') period?: DashboardPeriod,
		@Query('year') year?: string,
	) {
		const parsedYear = year ? Number(year) : undefined;

		if (year && (!Number.isFinite(parsedYear) || !Number.isInteger(parsedYear))) {
			throw new BadRequestException('year debe ser un numero entero valido');
		}

		return this.dashboardService.getEventsDashboard(period, parsedYear);
	}

	@Get('projects')
	getProjectsDashboard(
		@Query('period') period?: DashboardPeriod,
		@Query('year') year?: string,
	) {
		const parsedYear = year ? Number(year) : undefined;

		if (year && (!Number.isFinite(parsedYear) || !Number.isInteger(parsedYear))) {
			throw new BadRequestException('year debe ser un numero entero valido');
		}

		return this.dashboardService.getProjectsDashboard(period, parsedYear);
	}
}
