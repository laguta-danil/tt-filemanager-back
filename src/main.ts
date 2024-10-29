import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'

const errorsFormat = (err: ValidationError[]) => {
  const errors = [];

  err.forEach(i =>
    errors.push({
      field: i.property,
      message: Object.values(i.constraints)[0]
    })
  );

  return errors;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (err: ValidationError[]) => {
        throw new BadRequestException(errorsFormat(err));
      },
      stopAtFirstError: true,
      transform: true,
      whitelist: true
    })
  )
  app.enableCors({
    origin: true,
    credentials: true
  })
  await app.listen(3000)
}
bootstrap()
