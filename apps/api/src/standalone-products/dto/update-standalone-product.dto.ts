import { PartialType } from '@nestjs/swagger';
import { CreateStandaloneProductDto } from './create-standalone-product.dto';

export class UpdateStandaloneProductDto extends PartialType(CreateStandaloneProductDto) {}