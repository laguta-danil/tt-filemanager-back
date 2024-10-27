import { Module, OnModuleInit } from '@nestjs/common'
import { FileManagementController } from './file-management.controller'
import { PrismaService } from '../../providers/database/prisma.service'
import { CqrsModule } from '@nestjs/cqrs'
import { promises as fs } from 'fs'
import { UserRepository } from '../../infrastructure/user.repository'
import { AuthModule } from '../auth/auth.module'
import { FileRepository } from '../../infrastructure/file.repository'
import { StoreFileCommandHandler } from './use-cases/commands/create-file.command'
import { getMainUserFolderQueryHandler } from './use-cases/querys/get-main-user-folder.query'
import { CreateFolderCommandHandler } from './use-cases/commands/create-folder.command'
import { getFolderQueryHandler } from './use-cases/querys/get-folder.query'
import { AwsS3Module } from '../awsS3/aws.s3.module'
import { updateFileCommandHandler } from './use-cases/commands/update-file-name.command'
import { updateFolderCommandHandler } from './use-cases/commands/update-folder-name'

const fileManagementCommandHandlers = [StoreFileCommandHandler, CreateFolderCommandHandler, updateFileCommandHandler, updateFolderCommandHandler]

const fileManagementQueryHandlers = [getMainUserFolderQueryHandler, getFolderQueryHandler]

const repositories = [UserRepository, FileRepository]

@Module({
  imports: [CqrsModule, AuthModule, AwsS3Module],
  controllers: [FileManagementController],
  providers: [PrismaService, ...fileManagementCommandHandlers, ...fileManagementQueryHandlers, ...repositories,]
})

export class FileManagementModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const uploadDir = './uploads'

    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create directory ${uploadDir}:`, error)
    }
  }
}
