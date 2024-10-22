import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { QueryBus } from '@nestjs/cqrs';
import { AuthUserQuery } from '../use-cases/login-user.query';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private queryBus: QueryBus) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    return this.queryBus.execute(new AuthUserQuery({ email, password }));
  }
}
