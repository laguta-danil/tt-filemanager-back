import { Logger, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { GoogleStrategy } from './strategies/google.strategy'
import { AuthController } from './auth.controller'
import { ConfigModule } from '@nestjs/config'
import googleOauthConfig from './config/google-oauth.config'
import { ValidateGoogleUserCommandHandler } from './use-cases/validate-google-user.command'
import { UserRepository } from '../../infrastructure/user.repository'
import { PrismaService } from '../../providers/database/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticatedUserQueryHandler } from './use-cases/login-user.query'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthService } from './auth.service'
import { FileRepository } from '../../infrastructure/file.repository'
import { FolderRepository } from '../../infrastructure/folder.repository'

const strategies = [GoogleStrategy, LocalStrategy, JwtStrategy]

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [AuthController],
  providers: [
    ...strategies,
    ValidateGoogleUserCommandHandler,
    AuthenticatedUserQueryHandler,
    UserRepository,
    FileRepository,
    PrismaService,
    AuthService,
    Logger,
    FolderRepository
  ]
})
export class AuthModule { }
