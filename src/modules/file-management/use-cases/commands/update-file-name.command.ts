import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { HttpException, HttpStatus } from '@nestjs/common'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class updateFileCommand implements ICommand {
    constructor(
        public readonly data: {
            userId: number
            folderId: number,
            fileId: number,
            newFileName: string
        }
    ) { }
}
@CommandHandler(updateFileCommand)
export class updateFileCommandHandler implements ICommandHandler<updateFileCommand, void> {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly folderRepository: FolderRepository
    ) { }

    async execute({ data }: updateFileCommand): Promise<void> {
        const { userId, folderId, fileId, newFileName } = data

        //check rights to access folder
        await this.folderRepository.isUserFolder({
            userId,
            folderId
        })

        try {
            const file = await this.fileRepository.getFileById(fileId)

            //check duplicates name in files or folders
            await this.fileRepository.checkDuplicateNames({
                name: newFileName,
                folderId
            })

            await this.fileRepository.updateFileName({
                fileId: file.id,
                newFileName: newFileName,
            })

        } catch (error) {
            throw new HttpException(`Update file error - ${error}`, HttpStatus.CONFLICT)
        }
    }
}
