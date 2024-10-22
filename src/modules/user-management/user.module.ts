import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUserQueryHandler } from './use-cases/getUser';
import { UserRepository } from '../../infrastructure/user.repository';
import { PrismaService } from '../../providers/database/prisma.service';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [GetUserQueryHandler, UserRepository, PrismaService],
})
export class UserModule { }
