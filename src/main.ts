import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import * as parser from 'ua-parser-js';
import * as requestIp from 'request-ip';
import { HttpExceptionFilter } from './middlewares/exception';

const config = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    req.device = parser(req.headers['user-agent']);
    req.real_ip = requestIp.getClientIp(req);
    next();
  });
  // app.setGlobalPrefix('v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  //TODO: Add specific domains to whitelist cors
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  await app.listen(config.app.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
