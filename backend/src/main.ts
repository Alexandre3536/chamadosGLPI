import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // <--- Importe estes dois

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite para JSON (onde vai o seu Base64)
  app.use(json({ limit: '10mb' })); 
  
  // Aumenta o limite para dados de formulário
  app.use(urlencoded({ limit: '10mb', extended: true }));

  app.enableCors(); // Garante que o Front consiga falar com o Back
  await app.listen(3000);
  console.log('🚀 Backend Neo-GLPI rodando na porta 3000');
}
bootstrap();