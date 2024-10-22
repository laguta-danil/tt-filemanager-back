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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { StoreFileCommand } from './use-cases/commands/create-file.handler';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateFileNameDto } from './dto/update-file-name.dto';
import { UserId } from 'src/decorators/auth.decorator';
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';
import { StoreFileDto } from './dto/store-file.dto';
import { getMainUserFolderQuery } from './use-cases/querys/get-main-user-folder.query';
import { CreateFolderCommand } from './use-cases/commands/create-folder.command';
import { getFolderQuery } from './use-cases/querys/get-folder.query';

@UseGuards(JwtAuthenticationGuard)
@Controller('file-management')
export class FileManagementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post('file/:folderId')
  @UseInterceptors(FileInterceptor('file'))
  storeFile(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId,
    @Param() param: StoreFileDto,
  ) {
    return this.commandBus.execute(
      new StoreFileCommand({ file, userId, folderId: param.folderId }),
    );
  }

  @Post('folder/:folderId')
  createFolder(
    @Param() param: StoreFileDto,
    @Body() body: { folderName: string },
    @UserId() userId,
  ) {
    return this.commandBus.execute(
      new CreateFolderCommand({
        folderId: param.folderId,
        folderName: body.folderName,
        userId,
      }),
    );
  }

  @Get()
  getUserMainPage(@UserId() userId) {
    return this.queryBus.execute(new getMainUserFolderQuery(userId));
  }

  @Get('folder/:folderId')
  getFolder(@UserId() userId, @Param() param: StoreFileDto) {
    return this.queryBus.execute(
      new getFolderQuery({ folderId: param.folderId, userId }),
    );
  }

  @Patch('file/:id')
  updateFileName(
    @Param('fileId') fileId: string,
    @Body() updateFileManagementDto: UpdateFileNameDto,
  ) {
    return this.commandBus.execute(updateFileManagementDto);
  }

  @Patch('folder/:folderId')
  updateFolderName(
    @Param('folderId') folderId: string,
    @Body() updateFileManagementDto: UpdateFileNameDto,
  ) {
    return this.commandBus.execute(updateFileManagementDto);
  }

  @Delete('file/:fileId')
  removeFile(@Param('fileId') fileId: string) {
    return this.commandBus.execute(+fileId);
  }

  @Delete('folder/:folderId')
  removeFolder(@Param('folderId') folderId: string) {
    return this.commandBus.execute(+folderId);
  }
}
