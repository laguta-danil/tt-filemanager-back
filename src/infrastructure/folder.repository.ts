import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../providers/database/prisma.service'
import { Prisma } from '@prisma/client'
import { Order } from 'src/modules/file-management/dto/create-file-management.dto'

@Injectable()
export class FolderRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createMainFolder({ userId }: { userId: number }) {
        await this.prisma.folder.create({
            data: { userId: userId, mainFolder: true, createdAt: new Date() }
        })
    }

    async getUserMainFolder(userId: number) {
        return this.prisma.folder.findFirst({
            where: { userId: userId, mainFolder: true }
        })
    }

    async getFolderById(folderId: number) {
        return this.prisma.folder.findFirst({
            where: { id: folderId }
        })
    }

    async getRelatedFolders(data: { folderId: number, take: number, skip: number, search: string, sortByFolderName: Prisma.SortOrder }) {
        const { folderId, take, skip, search, sortByFolderName } = data

        const [folders, count] = await this.prisma.$transaction([
            this.prisma.folderToFolderRelation.findMany({
                orderBy: [{ folderName: 'asc' }],
                // skip: skip,
                // take: take,
                where: { folderId: folderId, folderName: { contains: `${search}`, mode: 'insensitive' } }
            }),
            this.prisma.folderToFolderRelation.count({ where: { folderId } })
        ])

        return { folders, total: count }
    }


    async createFolder({
        userId,
        folderId,
        folderName
    }: {
        userId: number
        folderId: number
        folderName: string
    }): Promise<void> {
        const newFolder = await this.prisma.folder.create({
            data: { userId, folderName, mainFolder: false, createdAt: new Date() }
        })

        await this.prisma.folderToFolderRelation.create({
            data: {
                folderId: folderId,
                folderInsideId: newFolder.id,
                folderName
            }
        })
    }

    async updateFolderName(data: { folderId: number, newFolderName: string }) {
        await this.prisma.folder.update({ where: { id: data.folderId }, data: { folderName: data.newFolderName } })
    }

    async deleteFolder(data: { folderId: number, userId: number }) {
        await this.prisma.folder.delete({ where: { id: data.folderId, userId: data.userId } })
    }

    async isUserFolder(data: { userId: number; folderId: number }): Promise<boolean> {
        const folder = await this.prisma.folder.findFirst({
            where: { userId: data.userId, id: data.folderId }
        })

        if (!folder) {
            throw new HttpException('You have no rights to access this folder', HttpStatus.BAD_REQUEST)
        }

        return true
    }

}
