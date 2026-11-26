import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query,
  Req, Res,
} from '@nestjs/common';
import { UserRole } from '@repo/types';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateRecognitionDto, UpdateRecognitionDto } from './dto/recognition.dto';

type RequestWithUser = { user: { role: UserRole } };

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  private requireAdmin(req: RequestWithUser) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden gestionar constancias.');
    }
  }

  @Get('teachers')
  teachers(@Req() req: RequestWithUser) {
    this.requireAdmin(req);
    return this.documents.teachers();
  }

  @Get('projects')
  projects(@Req() req: RequestWithUser, @Query('userId') userId: string) {
    this.requireAdmin(req);
    return this.documents.eligibleProjects(userId);
  }

  @Get()
  list(@Req() req: RequestWithUser) {
    this.requireAdmin(req);
    return this.documents.list();
  }

  @Get(':id/file')
  async file(@Req() req: RequestWithUser, @Param('id') id: string, @Res() res: Response) {
    this.requireAdmin(req);
    const pdf = await this.documents.getFile(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="constancia.pdf"');
    res.send(pdf);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateRecognitionDto) {
    this.requireAdmin(req);
    return this.documents.create(dto);
  }

  @Patch(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateRecognitionDto) {
    this.requireAdmin(req);
    return this.documents.update(id, dto);
  }

  @Post(':id/refresh')
  refresh(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.requireAdmin(req);
    return this.documents.refresh(id);
  }

  @Delete(':id')
  delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.requireAdmin(req);
    return this.documents.delete(id);
  }
}
