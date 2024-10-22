import { ICommandHandler, IQuery, QueryHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { UserRepository } from 'src/infrastructure/user.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

export class GetUserQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler
  implements ICommandHandler<GetUserQuery, User>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userId }): Promise<User> {
    try {
      const user = await this.userRepository.findUserById(userId);

      return user;
    } catch (error) {
      throw new HttpException(
        'Somethings wrong with cookie',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
