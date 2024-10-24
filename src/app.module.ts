import { Module } from '@nestjs/common'
import { FileManagementModule } from './modules/file-management/file-management.module'
import { UserModule } from './modules/user-management/user.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [FileManagementModule, UserModule, AuthModule],
  controllers: [],
  providers: []
})
export class AppModule {}
