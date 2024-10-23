import {
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';
import JwtAuthenticationGuard from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './guards/local-auth.guard';
import { UserId } from '../../decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger) { }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() { }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@UserId() userId, @Res() response: Response) {
    const token = this.authService.getCookieWithJwtToken(userId);
    this.logger.log(token)
    response.cookie('Authentication', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });
    response.redirect(process.env.FRONTEND_URL);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@UserId() userId, @Res() response: Response) {
    const cookie = this.authService.getCookieWithJwtToken(userId);
    response.setHeader('Set-Cookie', cookie);

    return response.sendStatus(200);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('logout')
  async logOut(@Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());

    return response.sendStatus(200);
  }
}
