import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSize = 5 * 1024 * 1024,
    private readonly allowedMimeTypes: string[] = [],
  ) {}

  transform(value: Express.Multer.File | Express.Multer.File[]) {
    if (!value) {
      throw new BadRequestException('No file(s) provided');
    }

    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      if (file.size > this.maxSize) {
        throw new BadRequestException(`${file.originalname} exceeds max size`);
      }

      if (
        this.allowedMimeTypes.length &&
        !this.allowedMimeTypes.includes(file.mimetype)
      ) {
        throw new BadRequestException(`${file.originalname} has invalid type`);
      }
    }

    return value;
  }
}
