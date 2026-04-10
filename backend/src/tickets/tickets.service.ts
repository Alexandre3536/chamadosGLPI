import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.ticket.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        // Garante que o ID do cliente seja um número inteiro
        cliente: { connect: { id: Number(data.clienteId) } }
      },
    });
  }

async findAll() {
  return this.prisma.ticket.findMany({
    include: { 
      cliente: true,
      messages: true // ADICIONE ISSO AQUI!
    },
    orderBy: {
      updatedAt: 'desc' // Opcional: faz os tickets com mensagens novas subirem na lista
    }
  });
}
}
