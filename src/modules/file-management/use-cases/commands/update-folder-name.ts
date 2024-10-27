import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { AwsS3Service } from '../../../awsS3/aws.s3.service'

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
        private readonly aswS3Service: AwsS3Service,
    ) { }

    async execute({ data }: updateFolderCommand): Promise<void> {
        const { userId, folderId, newFolderName } = data

        //check rights to access folder
        await this.fileRepository.isUserFolder({
            userId,
            folderId
        })

        try {
            const folder = await this.fileRepository.getFolderById(folderId)

            //check duplicates name in files or folders
            await this.fileRepository.checkDuplicateNames({
                name: newFolderName,
                folderId
            })

            await this.fileRepository.updateFolderName({
                folderId: folder.id,
                newFolderName: newFolderName,
            })

        } catch (error) {
            console.log('Update file error', error)
        }
    }
}
