import { ICommandHandler, IQuery, QueryHandler } from '@nestjs/cqrs';
import { FileRepository } from 'src/infrastructure/file.repository';

export class getMainUserFolderQuery implements IQuery {
  constructor(public readonly userId: number) {}
}
@QueryHandler(getMainUserFolderQuery)
export class getMainUserFolderQueryHandler
  implements ICommandHandler<getMainUserFolderQuery, void>
{
  constructor(private readonly fileRepository: FileRepository) {}

  async execute({ userId }: getMainUserFolderQuery): Promise<any> {
    const userMainFolder = await this.fileRepository.findUserMainFolder(userId);

    const [folders, files] = await Promise.all([
      await this.fileRepository.findRelatedFolders(userMainFolder.id),
      await this.fileRepository.findRelatedFiles(userMainFolder.id),
    ]);

    return { curentFolder: userMainFolder, folders, files };
  }
}
