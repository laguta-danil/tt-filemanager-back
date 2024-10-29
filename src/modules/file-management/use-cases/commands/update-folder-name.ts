import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { HttpException, HttpStatus } from '@nestjs/common'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class updateFolderCommand implements ICommand {
    constructor(
        public readonly data: {
            userId: number
            folderId: number,
            newFolderName: string
        }
    ) { }
}
@CommandHandler(updateFolderCommand)
export class updateFolderCommandHandler implements ICommandHandler<updateFolderCommand, void> {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly folderRepository: FolderRepository
    ) { }

    async execute({ data }: updateFolderCommand): Promise<void> {
        const { userId, folderId, newFolderName } = data

        //check rights to access folder
        await this.folderRepository.isUserFolder({
            userId,
            folderId
        })

        try {
            const folder = await this.folderRepository.getFolderById(folderId)

            //check duplicates name in files or folders
            await this.fileRepository.checkDuplicateNames({
                name: newFolderName,
                folderId
            })

            await this.folderRepository.updateFolderName({
                folderId: folder.id,
                newFolderName: newFolderName,
            })

        } catch (error) {
            throw new HttpException(`Update folder error - ${error}`, HttpStatus.CONFLICT)
        }
    }
}
