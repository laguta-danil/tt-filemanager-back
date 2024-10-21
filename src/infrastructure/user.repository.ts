import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/modules/user-management/dto/create-user.dto';
import { PrismaService } from 'src/providers/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUserById(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async createNewUser(userData: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: userData,
    });
  }

  async updateUser(userData: Partial<User>, userTgId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userTgId },
      data: userData,
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findFirst({ where: { id } });
  }
}
