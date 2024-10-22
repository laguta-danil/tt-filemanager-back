import { ICommandHandler, IQuery, QueryHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { UserRepository } from 'src/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthUserQuery implements IQuery {
  constructor(public readonly userData: { email: string; password: string }) {}
}

@QueryHandler(AuthUserQuery)
export class AuthenticatedUserQueryHandler
  implements ICommandHandler<AuthUserQuery, User>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userData }): Promise<User> {
    const { email, password } = userData;

    try {
      const user = await this.userRepository.findUserByEmail(email);
      await this.verifyPassword(password, user.password);
      user.password = undefined;

      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
    }
  }
}
