import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

async create(data: any) {
  return this.prisma.message.create({
    data: {
      texto: data.texto,
      imagem: data.imagem, // Aqui entra o Base64 da imagem
      ticket: {
        connect: { id: Number(data.ticketId) }
      },
      autor: {
        connect: { id: Number(data.autorId || 1) } // Se o front esquecer o ID, usamos o 1 (Alexandre)
      }
    },
    include: {
      autor: true // Isso garante que o nome do Alexandre apareça na mensagem logo após enviar
    }
  });
}

  findAllByTicket(ticketId: number) {
    return this.prisma.message.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        autor: { // Isso aqui é legal: traz o nome de quem escreveu a mensagem
          select: { nome: true }
        }
      }
    });
  }
}