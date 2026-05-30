import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://nexastream.fun',
      'https://www.nexastream.fun',
      'https://admin.nexastream.fun',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: ['auth', 'player_api.php', 'tb/a', 'update_pin'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
