import { Module, OnModuleInit } from '@nestjs/common';
import { FileManagementController } from './file-management.controller';
import { PrismaService } from 'src/providers/database/prisma.service';
import { CqrsModule } from '@nestjs/cqrs';
import { promises as fs } from 'fs';
import { UserRepository } from 'src/infrastructure/user.repository';
import { AuthModule } from '../auth/auth.module';
import { FileRepository } from 'src/infrastructure/file.repository';
import { StoreFileCommandHandler } from './use-cases/commands/create-file.handler';
import { getMainUserFolderQueryHandler } from './use-cases/querys/get-main-user-folder.query';
import { CreateFolderCommandHandler } from './use-cases/commands/create-folder.command';
import { getFolderQueryHandler } from './use-cases/querys/get-folder.query';
import { AwsS3Module } from '../awsS3/aws.s3.module';

const fileManagementCommandHandlers = [
  StoreFileCommandHandler,
  CreateFolderCommandHandler,
];

const fileManagementQueryHandlers = [
  getMainUserFolderQueryHandler,
  getFolderQueryHandler,
];

const repositories = [UserRepository, FileRepository];

@Module({
  imports: [CqrsModule, AuthModule, AwsS3Module],
  controllers: [FileManagementController],
  providers: [
    PrismaService,
    ...fileManagementCommandHandlers,
    ...fileManagementQueryHandlers,
    ...repositories,
  ],
})
export class FileManagementModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const uploadDir = './uploads';

    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${uploadDir}:`, error);
    }
  }
}
