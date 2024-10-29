import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { AwsS3Service } from '../../../awsS3/aws.s3.service'
import { HttpException, HttpStatus } from '@nestjs/common'
import { FolderRepository } from '../../../../infrastructure/folder.repository'

export class StoreFileCommand implements ICommand {
  constructor(
    public readonly data: {
      file: Express.Multer.File
      userId: number
      folderId: number
    }
  ) { }
}
@CommandHandler(StoreFileCommand)
export class StoreFileCommandHandler implements ICommandHandler<StoreFileCommand, void> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly aswS3Service: AwsS3Service,
  ) { }

  async execute({ data }: StoreFileCommand): Promise<void> {
    const { file, userId, folderId } = data

    //check rights to access folder
    await this.folderRepository.isUserFolder({
      userId,
      folderId
    })

    //check duplicates name in files or folders
    await this.fileRepository.checkDuplicateNames({
      name: file.originalname,
      folderId
    })

    try {
      const imgUrl = await this.aswS3Service.uploadFile({ file, userId })

      await this.fileRepository.createFile({
        fileExtensions: file.mimetype,
        fileName: file.originalname,
        folderId: folderId, s3Url: imgUrl
      })

    } catch (error) {
      throw new HttpException(`Update folder error - ${error}`, HttpStatus.CONFLICT)
    }
  }
}
