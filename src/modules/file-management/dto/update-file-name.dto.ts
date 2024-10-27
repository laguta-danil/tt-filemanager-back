import { StoreFileDto } from './store-file.dto'
import { IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateFileNameDto extends StoreFileDto {
    @IsNumber()
    @Transform(({ value }) => Number(value))
    fileId: number
}
