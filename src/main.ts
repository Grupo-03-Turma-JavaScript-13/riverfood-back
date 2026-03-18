import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   const config = new DocumentBuilder()
  .setTitle('RiverFood')
  .setDescription('Projeto RiverFood')
  .setContact("River Technology","https://github.com/Grupo-03-Turma-JavaScript-13/RiverFood","eriicky@live.com")
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);


  process.env.TZ = '-03:00';

  app.useGlobalPipes(new ValidationPipe({ transform: true}));
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
