import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createActivityDto: CreateActivityDto, @Req() req) {
    return this.activitiesService.create(createActivityDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req,
  ) {
    return this.activitiesService.update(id, updateActivityDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
