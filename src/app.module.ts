import { Module } from '@nestjs/common';
import { FileManagementModule } from './modules/file-management/file-management.module';
import { UserModule } from './modules/user-management/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AwsS3Module } from './modules/awsS3/aws.s3.module';

@Module({
  imports: [FileManagementModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
