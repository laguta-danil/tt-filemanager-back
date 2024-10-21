import { Module } from '@nestjs/common';
import { AwsS3Service } from './aws.s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true })],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module { }
