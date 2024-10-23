import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { UserRepository } from '../../../infrastructure/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository,
    private readonly logger: Logger) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number }) {
    this.logger.log('payload', payload)
    try {
      const user = await this.userRepository.findUserById(payload.userId);
      this.logger.log('user', user)
      return user
    } catch (e) {
      return { email: '1123123@gij.com' }
      // throw new HttpException(
      //   'User with this id does not exist',
      //   HttpStatus.NOT_FOUND,
      // );
    }
  }
}
