import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class StoreFileDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  folderId: number;
}
