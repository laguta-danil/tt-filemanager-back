import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { HttpException, HttpStatus } from '@nestjs/common'

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
        private readonly fileRepository: FileRepository,
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
            console.log({ folderId, userId })
            await this.fileRepository.deleteFolder({ folderId, userId })

        } catch (error) {
            throw new HttpException(`Delete folder Error - ${error}`, HttpStatus.CONFLICT)
        }

    }
}
