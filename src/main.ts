import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync } from 'fs';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth'; // ← * as o'rniga default import
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); 

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.use(cookieParser());

  app.use('/api/docs', basicAuth({
    challenge: true,
    users: { 'axrorbek': '0507' }
  }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
  }));

  app.useGlobalFilters(new PrismaExceptionFilter());

  const uploadsRoot = join(process.cwd(), 'uploads');
  const staticUploadsPath = existsSync(uploadsRoot)
    ? uploadsRoot
    : join(__dirname, '..', 'uploads');

  app.useStaticAssets(staticUploadsPath, {
    prefix: '/uploads',
  });

  const config = new DocumentBuilder()
    .setTitle('CRM LOYIHASI UCHUN.')
    .setDescription('Foydalanuvchilar boshqaruv tizimi')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log(`✅ Server ishlayapti: http://localhost:${port}`);
  console.log(`📚 Swagger UI:       http://localhost:${port}/api/docs`);
}
bootstrap();