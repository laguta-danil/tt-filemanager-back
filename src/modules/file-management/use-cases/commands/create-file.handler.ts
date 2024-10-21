import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { FileRepository } from 'src/infrastructure/file.repository';
import { AwsS3Service } from 'src/modules/awsS3/aws.s3.service';

export class StoreFileCommand implements ICommand {
  constructor(
    public readonly data: {
      file: Express.Multer.File;
      userId: number;
      folderId: number;
    },
  ) { }
}
@CommandHandler(StoreFileCommand)
export class StoreFileCommandHandler
  implements ICommandHandler<StoreFileCommand, void> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly aswS3Service: AwsS3Service,
  ) { }

  async execute({ data }: StoreFileCommand): Promise<void> {
    const { file, userId, folderId } = data;
    const uploadDir = './uploads';

    //check rights to access folder
    await this.fileRepository.isUserFolder({
      userId,
      folderId,
    });

    //check duplicates name in files or folders
    await this.fileRepository.checkDuplicateNames({
      name: file.originalname,
      folderId,
    })


    try {
      await fs.mkdir(uploadDir + '/' + userId, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${uploadDir}:`, error);
    }

    await Promise.all([
      await fs.writeFile(
        uploadDir + '/' + userId + '/' + file.originalname,
        file.buffer,
        'base64',
      ),
      // await this.fileRepository.addFile({
      //   fileExtensions: file.mimetype,
      //   fileName: file.originalname,
      //   folderId,
      // }),
    ])


    try {
      const sizes = [250];

      // сохраняем основное фото для дальнейшей обработки
      const fileLink = uploadDir + '/temp' + '/' + `${userId}`;
      await fs.writeFile(fileLink, file.buffer, 'base64');

      // обработчики, сначала загоняем в буфер, по другому не сможем сохранить контент тайп, после записываем картинки с изменными размерами
      await Promise.all(
        sizes.map(async (el) => {
          const resizedImageBuf = await sharp(fileLink).resize(el).toBuffer();

          await fs.writeFile(
            `${uploadDir}/${userId}${el}.jpg`,
            resizedImageBuf,
            'base64',
          );

          // отправляем все на Авс С3 бакет
          const url = await this.aswS3Service.uploadImage(
            uploadDir + '/',
            `${userId}${el}.jpg`,
          );


          await this.fileRepository.addFile({
            fileExtensions: file.mimetype,
            fileName: file.originalname,
            folderId,
            previewImg: url,
          });

          // чистим временные копии с диска
          await fs.unlink(uploadDir + '/' + `${userId}${el}.jpg`);
        }),
      );


      // удаляем основное фото с диска
      await fs.unlink(fileLink);
    } catch (e) {
      console.log('something went wrong')
    }
  }
}
