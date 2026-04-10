import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mantém seus limites de 10mb para as fotos do Neo-GLPI
  app.use(json({ limit: '10mb' })); 
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Ajuste do CORS: Liberando para a Vercel conseguir acessar
  app.enableCors({
    origin: '*', // Permite qualquer origem (ideal para agora)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // AJUSTE DA PORTA: Essencial para o Render!
  // Ele vai tentar ler a porta que o Render der, se não houver, usa a 3000
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`🚀 Backend Neo-GLPI rodando na porta ${port}`);
}
bootstrap();