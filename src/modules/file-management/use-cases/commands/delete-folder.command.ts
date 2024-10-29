import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { HttpException, HttpStatus } from '@nestjs/common'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class deleteFolderCommand implements ICommand {
    constructor(
        public readonly data: {
            userId: number
            folderId: number,
        }
    ) { }
}
@CommandHandler(deleteFolderCommand)
export class deleteFolderCommandHandler implements ICommandHandler<deleteFolderCommand, void> {
    constructor(
        private readonly folderRepository: FolderRepository
    ) { }

    async execute({ data }: deleteFolderCommand): Promise<void> {
        const { userId, folderId } = data

        //TODO Check ROLE !
        //check rights to access folder
        // await this.fileRepository.isUserFolder({
        //     userId,
        //     fileId
        // })

        try {
            await this.folderRepository.deleteFolder({ folderId, userId })

        } catch (error) {
            throw new HttpException(`Delete folder Error - ${error}`, HttpStatus.CONFLICT)
        }

    }
}
