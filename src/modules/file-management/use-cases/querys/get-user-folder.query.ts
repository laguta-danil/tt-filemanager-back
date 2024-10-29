import { ICommandHandler, IQuery, QueryHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { Folder, Prisma } from '@prisma/client'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class getUserFolderQuery implements IQuery {
  constructor(public readonly data: {
    userId: number,
    mainPage: boolean,
    folderId?: number,
    take?: number,
    search?: string,
    sortByFolderName?: Prisma.SortOrder,
    sortByFileName?: Prisma.SortOrder
  }) { }
}
@QueryHandler(getUserFolderQuery)
export class getUserFolderQueryHandler implements ICommandHandler<getUserFolderQuery, void> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository) { }

  async execute({ data }: getUserFolderQuery): Promise<any> {


    const { userId, mainPage, folderId, take, search, sortByFolderName, sortByFileName } = data

    const skip = (+1 - 1) * +1 || 0;

    console.log(data.sortByFolderName, sortByFileName, 'wtf', data)
    const userFolder = await this.getUserFolder({ userId, mainPage, folderId })

    const [folders, files] = await Promise.all([
      await this.folderRepository.getRelatedFolders({ folderId: userFolder.id, search, sortByFolderName, take, skip }),
      await this.fileRepository.getRelatedFiles({ folderId: userFolder.id, search, sortByFileName, take, skip })
    ])

    return { curentFolder: userFolder, folders: folders.folders, totalFolders: folders.total, files: files.files, totalFiles: files.total }
  }


  private async getUserFolder(data: { userId: number, mainPage: boolean, folderId: number }): Promise<Folder> {
    const { userId, mainPage, folderId } = data

    if (mainPage) {
      return await this.folderRepository.getUserMainFolder(userId)
    }

    if (!mainPage && folderId) {

      //check rights to access folder
      await this.folderRepository.isUserFolder({
        userId,
        folderId
      })

      return await this.folderRepository.getFolderById(folderId)
    }

  }
}
