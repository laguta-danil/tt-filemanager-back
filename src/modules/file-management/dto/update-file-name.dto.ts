import { PartialType } from '@nestjs/mapped-types';
import { StoreFileDto } from './store-file.dto';

export class UpdateFileNameDto extends PartialType(StoreFileDto) {}
