import { Prisma } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

export class StoreFileDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  folderId: number
}

export class getFolderDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  folderId?: number

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  mainPage: boolean

  @IsString()
  @IsOptional()
  search?: string

  @IsEnum(Prisma.SortOrder)
  @IsOptional()
  sortByFileName?: Prisma.SortOrder = Prisma.SortOrder.asc;

  @IsEnum(Prisma.SortOrder)
  @IsOptional()
  sortByFolderName?: Prisma.SortOrder = Prisma.SortOrder.asc;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  take?: number
}
