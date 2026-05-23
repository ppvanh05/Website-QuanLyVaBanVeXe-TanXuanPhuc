import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép Angular frontend (port 4200) gọi API tới backend (port 3000)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend đang chạy tại: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
