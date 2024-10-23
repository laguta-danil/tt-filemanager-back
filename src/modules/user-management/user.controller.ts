import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserId } from '../../decorators/auth.decorator';
import { GetUserQuery } from './use-cases/getUser';
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: Logger) { }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async getUser(@Req() req, @UserId() userId) {
    this.logger.warn(req.cookie)
    // const user = await this.queryBus.execute(new GetUserQuery(userId));

    return { email: user.email };
  }
}
