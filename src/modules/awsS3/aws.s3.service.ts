import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'

@Injectable()
export class AwsS3Service {
  constructor(private configService: ConfigService) { }

  private bucketName = process.env.AWS_PROFILE_PHOTO_BUCKET_NAME

  private s3 = new S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
  })

  async uploadFile(data: { file: Express.Multer.File, userId: number }): Promise<string> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${data.userId}/${data.file.originalname}`,
          Body: data.file.buffer,
          ContentType: data.file.mimetype
        })
      )
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.userId}/${data.file.originalname}`
    } catch (e) {
      throw new HttpException('User with this id does not exist', HttpStatus.EXPECTATION_FAILED)
    }
  }

  async deleteFile(data: { fileName: string; userId: number, fileUrl: string }) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: `${data.userId}/${data.fileName}`
      })
    } catch (e) {
      throw new HttpException('AWS S3 Error', HttpStatus.CONFLICT)
    }

  }

  removeDuplicates(data) {
    return [...new Set(data)]
  }
}
