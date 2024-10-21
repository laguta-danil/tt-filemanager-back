import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserId } from 'src/decorators/auth.decorator';
import { PrismaService } from 'src/providers/database/prisma.service';

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) { }

  async addFile({
    fileExtensions,
    fileName,
    folderId,
    previewImg
  }: {
    fileExtensions: string;
    fileName: string;
    folderId: number;
    previewImg: string
  }) {
    const newFile = await this.prisma.file.create({
      data: { fileExtensions: fileExtensions, fileName: fileName },
    });

    await this.prisma.folderToFileRelation.create({
      data: {
        folderId: folderId,
        fileId: newFile.id,
        fileName: newFile.fileName,
      },
    });
  }

  async createMainFolder({ userId }: { userId: number }) {
    return this.prisma.folder.create({
      data: { userId: userId, mainFolder: true },
    });
  }

  async findUserMainFolder(userId: number) {
    return this.prisma.folder.findFirst({
      where: { userId: userId, mainFolder: true },
    });
  }

  async findFolderById(folderId: number) {
    return this.prisma.folder.findFirst({
      where: { id: folderId },
    });
  }

  async findRelatedFolders(folderId: number) {
    return this.prisma.folderToFolderRelation.findMany({
      where: { folderId: folderId },
    });
  }

  async findRelatedFiles(folderId: number) {
    return this.prisma.folderToFileRelation.findMany({
      where: { folderId: folderId },
    });
  }

  async createFolder({
    userId,
    folderId,
    folderName,
  }: {
    userId: number;
    folderId: number;
    folderName: string;
  }): Promise<void> {
    const newFolder = await this.prisma.folder.create({
      data: { userId: userId, folderName: folderName, mainFolder: false },
    });

    await this.prisma.folderToFolderRelation.create({
      data: {
        folderId: folderId,
        folderInsideId: newFolder.id,
        folderInsideName: newFolder.folderName,
      },
    });
  }

  async isUserFolder(data: {
    userId: number;
    folderId: number;
  }): Promise<boolean> {
    const folder = await this.prisma.folder.findFirst({
      where: { userId: data.userId, id: data.folderId },
    });

    if (!folder) {
      throw new HttpException(
        'You have no rights to access this folder',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  async checkDuplicateNames(data: {
    name: string;
    folderId: number;
  }): Promise<void> {
    const isFolderNameExist =
      await this.prisma.folderToFolderRelation.findFirst({
        where: { folderId: data.folderId, folderInsideName: data.name },
      });

    if (isFolderNameExist) {
      throw new HttpException(
        'A folder with this name already exist',
        HttpStatus.CONFLICT,
      );
    }

    const isFileNameExist = await this.prisma.folderToFileRelation.findFirst({
      where: { folderId: data.folderId, fileName: data.name },
    });

    if (isFileNameExist) {
      throw new HttpException(
        'A file with this name already exist',
        HttpStatus.CONFLICT,
      );
    }
  }
}
