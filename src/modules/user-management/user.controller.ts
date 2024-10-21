import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserId } from 'src/decorators/auth.decorator';
import { GetUserQuery } from './use-cases/getUser';
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async getUser(@UserId() userId) {
    const user = await this.queryBus.execute(new GetUserQuery(userId));

    return { email: user.email };
  }
}
