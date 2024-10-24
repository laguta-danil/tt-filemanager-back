import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs'
import { promises as fs } from 'fs'
import sharp from 'sharp'
import { FileRepository } from '../../../../infrastructure/file.repository'
import { AwsS3Service } from '../../../awsS3/aws.s3.service'

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
    private readonly aswS3Service: AwsS3Service,
  ) { }

  async execute({ data }: StoreFileCommand): Promise<void> {
    const { file, userId, folderId } = data

    //check rights to access folder
    await this.fileRepository.isUserFolder({
      userId,
      folderId
    })

    //check duplicates name in files or folders
    await this.fileRepository.checkDuplicateNames({
      name: file.originalname,
      folderId
    })

    // try {
    //   await fs.mkdir(uploadDir + '/' + userId, { recursive: true })
    // } catch (error) {
    //   console.error(`Failed to create directory ${uploadDir}:`, error)
    // }



    try {
      const imgUrl = await this.aswS3Service.uploadFile({ file, userId })
      console.log(imgUrl)

      await this.fileRepository.addFile({
        fileExtensions: file.mimetype,
        fileName: file.originalname,
        folderId, previewImg: imgUrl
      })

    } catch (e) {
      console.log('something went wrong with AWS S3 storing', e)
    }
  }
}
