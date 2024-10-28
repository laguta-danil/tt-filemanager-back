import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../providers/database/prisma.service'

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

  async createMainFolder({ userId }: { userId: number }) {
    const mainFolder = await this.prisma.folder.create({
      data: { userId: userId, mainFolder: true, createdAt: new Date() }
    })

    await this.getRelatedFiles(mainFolder.id)
  }

  async getUserMainFolder(userId: number) {

    return this.prisma.folder.findFirst({
      where: { userId: userId, mainFolder: true }
    })
  }

  async getFolderById(folderId: number) {
    return this.prisma.folder.findFirst({
      where: { id: folderId }
    })
  }

  async getRelatedFolders(folderId: number) {
    return this.prisma.folderToFolderRelation.findMany({
      where: { folderId: folderId }
    })
  }

  async getRelatedFiles(folderId: number) {
    return this.prisma.folderToFileRelation.findMany({
      where: { folderId: folderId }
    })
  }

  async createFolder({
    userId,
    folderId,
    folderName
  }: {
    userId: number
    folderId: number
    folderName: string
  }): Promise<void> {
    const newFolder = await this.prisma.folder.create({
      data: { userId, folderName, mainFolder: false, createdAt: new Date() }
    })

    await this.prisma.folderToFolderRelation.create({
      data: {
        folderId: folderId,
        folderInsideId: newFolder.id,
        folderName
      }
    })
  }

  async updateFolderName(data: { folderId: number, newFolderName: string }) {
    await this.prisma.folder.update({ where: { id: data.folderId }, data: { folderName: data.newFolderName } })
  }

  async deleteFolder(data: { folderId: number, userId: number }) {
    await this.prisma.folder.delete({ where: { id: data.folderId, userId: data.userId } })
  }

  async isUserFolder(data: { userId: number; folderId: number }): Promise<boolean> {
    const folder = await this.prisma.folder.findFirst({
      where: { userId: data.userId, id: data.folderId }
    })

    if (!folder) {
      throw new HttpException('You have no rights to access this folder', HttpStatus.BAD_REQUEST)
    }

    return true
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
