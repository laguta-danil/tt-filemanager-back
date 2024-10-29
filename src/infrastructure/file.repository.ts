import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../providers/database/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createFile({
    fileExtensions,
    fileName,
    folderId,
    s3Url
  }: {
    fileExtensions: string
    fileName: string
    folderId: number
    s3Url: string
  }) {
    const newFile = await this.prisma.file.create({
      data: {
        fileExtensions: fileExtensions,
        fileName: fileName,
        s3Url: s3Url,
        createdAt: new Date()
      }
    })

    await this.prisma.folderToFileRelation.create({
      data: {
        folderId: folderId,
        fileId: newFile.id,
        fileUrl: s3Url,
        fileName
      }
    })
  }

  async getFileById(fileId: number) {
    return this.prisma.file.findFirstOrThrow({ where: { id: fileId, } })
  }

  async updateFileName(data: { fileId: number, newFileName: string }) {
    await this.prisma.file.update({ where: { id: data.fileId }, data: { fileName: data.newFileName, } })
  }

  async deleteFile(fileId: number) {
    await this.prisma.file.delete({ where: { id: fileId } })
  }

  async getRelatedFiles(data: { folderId: number, take: number, skip: number, search: string, sortByFileName: Prisma.SortOrder }) {
    const { folderId, take, skip, search, sortByFileName } = data

    const [files, count] = await this.prisma.$transaction([
      this.prisma.folderToFileRelation.findMany({
        orderBy: [{ fileName: sortByFileName }],
        // skip: skip,
        // take: take,
        where: { folderId: folderId, fileName: { contains: `${search}`, mode: 'insensitive' } }
      }),
      this.prisma.folderToFileRelation.count({ where: { folderId } })
    ])

    return { files, total: count }
  }

  async checkDuplicateNames(data: { name: string; folderId: number }): Promise<void> {
    const isFolderNameExist = await this.prisma.folderToFolderRelation.findFirst({
      where: { folderId: data.folderId, folder: { folderName: data.name } }
    })

    if (isFolderNameExist) {
      throw new HttpException('A folder with this name already exist', HttpStatus.CONFLICT)
    }

    const isFileNameExist = await this.prisma.folderToFileRelation.findFirst({
      where: { folderId: data.folderId, file: { fileName: data.name } }

    })

    if (isFileNameExist) {
      throw new HttpException('A file with this name already exist', HttpStatus.CONFLICT)
    }
  }
}
