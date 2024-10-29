import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class CreateFolderCommand implements ICommand {
  constructor(
    public readonly data: {
      folderName: string
      userId: number
      folderId: number
    }
  ) { }
}
@CommandHandler(CreateFolderCommand)
export class CreateFolderCommandHandler implements ICommandHandler<CreateFolderCommand, void> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository
  ) { }

  async execute({ data }: CreateFolderCommand): Promise<void> {
    const { folderName, userId, folderId } = data

    //check rights to access folder
    await this.folderRepository.isUserFolder({
      userId,
      folderId
    })

    //check duplicates name in files or folders
    await this.fileRepository.checkDuplicateNames({
      name: folderName,
      folderId: folderId
    })

    await this.folderRepository.createFolder({ userId, folderId, folderName })
  }
}
