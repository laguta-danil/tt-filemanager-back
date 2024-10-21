import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import fs from 'fs/promises';

@Injectable()
export class AwsS3Service {
  constructor(private configService: ConfigService) { }

  private bucketName = process.env.AWS_PROFILE_PHOTO_BUCKET_NAME;

  private s3 = new S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  async uploadImage(filePath: any, fileName: string) {
    try {
      const blob = await fs.readFile(filePath + fileName);

      // remove spaces between words
      fileName = fileName.replace(/\s/g, '');

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `users/photo/${fileName}`,
          Body: blob,
          ContentType: 'image/jpg',
        }),
      );
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (e) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  removeDuplicates(data) {
    return [...new Set(data)];
  }
}
