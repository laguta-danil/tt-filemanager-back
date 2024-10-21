import { ICommandHandler, IQuery, QueryHandler } from '@nestjs/cqrs';
import { FileRepository } from 'src/infrastructure/file.repository';

export class getFolderQuery implements IQuery {
  constructor(public readonly data: { folderId: number; userId: number }) {}
}
@QueryHandler(getFolderQuery)
export class getFolderQueryHandler
  implements ICommandHandler<getFolderQuery, void>
{
  constructor(private readonly fileRepository: FileRepository) {}

  async execute({ data }: getFolderQuery): Promise<any> {
    const { folderId, userId } = data;

    //check rights to access folder
    await this.fileRepository.isUserFolder({
      userId,
      folderId,
    });

    const currentFolder = await this.fileRepository.findFolderById(folderId);

    const [folders, files] = await Promise.all([
      await this.fileRepository.findRelatedFolders(folderId),
      await this.fileRepository.findRelatedFiles(folderId),
    ]);

    return { currentFolder, folders, files };
  }
}
