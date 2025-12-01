import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get(':password')
  runSeed(@Param('password') password: string) {
    return this.seedService.runSeed(password);
  }
}
