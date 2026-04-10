import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Isso faz ele ser visível para o TicketsModule automaticamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}