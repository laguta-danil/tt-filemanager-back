import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRepository } from '../../../infrastructure/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
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
    console.log(payload)
    try {
      const user = this.userRepository.findUserById(payload.userId);
      console.log(user)
      return user
    } catch (e) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
