import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { UserType } from '@repo/types';

type DashboardPeriod = 'T1' | 'T2' | 'T3';

type TrendPoint = {
    label: string;
    events: number;
    participants: number;
};

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<Event>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

    private getPeriodRange(period: DashboardPeriod, year: number) {
    const ranges: Record<DashboardPeriod, { startMonth: number; endMonth: number }> = {
            T1: { startMonth: 0, endMonth: 3 },
            T2: { startMonth: 4, endMonth: 7 },
            T3: { startMonth: 8, endMonth: 11 },
    };

    const periodRange = ranges[period];
        return {
            startDate: new Date(year, periodRange.startMonth, 1, 0, 0, 0, 0),
            endDate: new Date(year, periodRange.endMonth + 1, 0, 23, 59, 59, 999),
        };
    }

    private getEventParticipantsCount(event: Pick<Event, 'attendance' | 'participants'>) {
        const men = event.attendance?.men ?? 0;
        const women = event.attendance?.women ?? 0;
        const totalFromAttendance = event.attendance?.totalParticipants;
        const participantsLength = Array.isArray(event.participants)
            ? event.participants.length
            : 0;

        return totalFromAttendance ?? (men + women > 0 ? men + women : participantsLength);
    }

    private buildMonthlyTrend(
        events: Array<Pick<Event, 'startDate' | 'attendance'>>,
    ): TrendPoint[] {
        const trendMap = new Map<string, { events: number; participants: number }>();

        for (const event of events) {
            const eventDate = new Date(event.startDate);
            const label = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
            const current = trendMap.get(label) ?? { events: 0, participants: 0 };
                const totalParticipants = event.attendance?.totalParticipants ?? 0;

            current.events += 1;
                current.participants += totalParticipants;
            trendMap.set(label, current);
    }

        return Array.from(trendMap.entries())
            .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
            .map(([label, values]) => ({
                label,
                events: values.events,
                participants: values.participants,
            }));
    }

    async getEventsDashboard(
        period: DashboardPeriod = 'T1',
        year: number = new Date().getFullYear(),
    ) {
        const validPeriods: DashboardPeriod[] = ['T1', 'T2', 'T3'];

        if (!validPeriods.includes(period)) {
            throw new BadRequestException('period debe ser T1, T2 o T3');
        }

        const { startDate, endDate } = this.getPeriodRange(period, year);
        const dateFilter = { startDate: { $gte: startDate, $lte: endDate } };

        const [events, participantsByType] = await Promise.all([
            this.eventModel
                .find(dateFilter, { attendance: 1, participants: 1, startDate: 1 })
                .lean(),
            this.eventModel.aggregate<{
                _id: string;
                count: number;
            }>([
                { $match: dateFilter },
                { $unwind: '$participants' },
                {
                    $lookup: {
                        from: this.userModel.collection.name,
                        localField: 'participants',
                        foreignField: '_id',
                        as: 'participantUser',
                    },
                },
                { $unwind: '$participantUser' },
                {
                    $group: {
                        _id: '$participantUser.type',
                        count: { $sum: 1 },
                    },
                },
            ]),
    ]);

        const studentsParticipants =
            participantsByType.find((item) => item._id === UserType.ESTUDIANTE)?.count ?? 0;
        const teachersParticipants =
            participantsByType.find((item) => item._id === UserType.MAESTRO)?.count ?? 0;

        const attendanceTotals = events.reduce(
            (acc, event) => {
        const men = event.attendance?.men ?? 0;
        const women = event.attendance?.women ?? 0;

        acc.men += men;
        acc.women += women;
                acc.totalParticipants += this.getEventParticipantsCount(event);

        return acc;
            },
            { men: 0, women: 0, totalParticipants: 0 },
    );

        const trend = this.buildMonthlyTrend(events);

        return {
            period,
            year,
            dateRange: {
                startDate,
                endDate,
            },
            kpis: {
                totalEvents: events.length,
                totalParticipants: attendanceTotals.totalParticipants,
                studentsParticipants,
                teachersParticipants,
            },
            sexBreakdown: {
                men: attendanceTotals.men,
                women: attendanceTotals.women,
                total: attendanceTotals.men + attendanceTotals.women,
            },
            trend,
        };
    }
}