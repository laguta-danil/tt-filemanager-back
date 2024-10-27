import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { AwsS3Service } from '../../../awsS3/aws.s3.service'

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
        private readonly aswS3Service: AwsS3Service,
    ) { }

    async execute({ data }: updateFileCommand): Promise<void> {
        const { userId, folderId, fileId, newFileName } = data

        //check rights to access folder
        await this.fileRepository.isUserFolder({
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
            console.log('Update file error', error)
        }
    }
}
