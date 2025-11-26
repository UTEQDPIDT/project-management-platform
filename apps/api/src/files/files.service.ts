import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: string) {
    return `This action returns a #${id} file`;
  }

  remove(id: string) {
    return `This action removes a #${id} file`;
  }
}
