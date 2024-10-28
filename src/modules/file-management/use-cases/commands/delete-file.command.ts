import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { AwsS3Service } from '../../../awsS3/aws.s3.service'

export class deleteFileCommand implements ICommand {
    constructor(
        public readonly data: {
            userId: number
            fileId: number,
        }
    ) { }
}
@CommandHandler(deleteFileCommand)
export class deleteFileCommandHandler implements ICommandHandler<deleteFileCommand, void> {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly aswS3Service: AwsS3Service,
    ) { }

    async execute({ data }: deleteFileCommand): Promise<void> {
        const { userId, fileId } = data

        //TODO Check ROLE !
        //check rights to access folder
        // await this.fileRepository.isUserFolder({
        //     userId,
        //     fileId
        // })

        const file = await this.fileRepository.getFileById(fileId)

        await Promise.all([
            await this.aswS3Service.deleteFile({
                userId: userId,
                fileName: file.fileName,
                fileUrl: file.s3Url
            }),
            await this.fileRepository.deleteFile(fileId)
        ])

    }
}
