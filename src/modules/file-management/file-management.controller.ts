import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { StoreFileCommand } from './use-cases/commands/create-file.command'
import { FileInterceptor } from '@nestjs/platform-express'
import { UpdateFileNameDto } from './dto/update-file-management.dto'
import { UserId } from '../../decorators/auth.decorator'
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard'
import { getFolderDto, StoreFileDto } from './dto/create-file-management.dto'
import { getUserFolderQuery } from './use-cases/querys/get-user-folder.query'
import { CreateFolderCommand } from './use-cases/commands/create-folder.command'
import { updateFileCommand } from './use-cases/commands/update-file-name.command'
import { updateFolderCommand } from './use-cases/commands/update-folder-name'
import { deleteFileCommand } from './use-cases/commands/delete-file.command'
import { deleteFolderCommand } from './use-cases/commands/delete-folder.command'

@UseGuards(JwtAuthenticationGuard)
@Controller('file-management')
export class FileManagementController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

  @Post('file/:folderId')
  @UseInterceptors(FileInterceptor('file'))
  storeFile(@UploadedFile() file: Express.Multer.File, @UserId() userId, @Param() param: StoreFileDto) {
    return this.commandBus.execute(new StoreFileCommand({ file, userId, folderId: param.folderId }))
  }

  @Post('folder/:folderId')
  createFolder(@Param() param: StoreFileDto, @Body() body: { folderName: string }, @UserId() userId) {
    return this.commandBus.execute(
      new CreateFolderCommand({
        folderId: param.folderId,
        folderName: body.folderName,
        userId
      })
    )
  }

  @Get()
  getUserFolderPage(@UserId() userId, @Query() query: getFolderDto) {
    return this.queryBus.execute(new getUserFolderQuery({ userId, ...query }))
  }

  @Patch('file/:folderId/:fileId')
  updateFileName(
    @UserId() userId,
    @Param() param: UpdateFileNameDto,
    @Body() body: { newFileName: string }) {
    return this.commandBus.execute(new updateFileCommand({ userId, fileId: param.fileId, folderId: param.folderId, newFileName: body.newFileName }))
  }

  @Patch('folder/:folderId')
  updateFolderName(@Param() param: StoreFileDto, @Body() body: { newFolderName: string }, @UserId() userId,) {
    return this.commandBus.execute(new updateFolderCommand({ userId, folderId: param.folderId, newFolderName: body.newFolderName }))
  }

  @Delete('file')
  removeFile(@UserId() userId, @Body() body: { fileId: number }) {
    return this.commandBus.execute(new deleteFileCommand({ fileId: body.fileId, userId }))
  }

  @Delete('folder')
  removeFolder(@Body() body: { folderId: number }, @UserId() userId) {
    return this.commandBus.execute(new deleteFolderCommand({ folderId: body.folderId, userId: userId }))
  }
}
