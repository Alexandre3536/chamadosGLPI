import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // Verifique se o caminho está correto
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [PrismaModule, AuthModule, TicketsModule], // O PrismaModule DEVE estar aqui
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
