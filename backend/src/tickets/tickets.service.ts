import { Injectable, NotFoundException } from '@nestjs/common';
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
        cliente: { connect: { id: Number(data.clienteId) } }
      },
    });
  }

  async findAll(userId?: number) {
    return this.prisma.ticket.findMany({
      where: userId ? { clienteId: userId } : {}, 
      include: { 
        cliente: true,
        // O PULO DO GATO: Traz apenas a última mensagem para o selo azul funcionar na Home
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, 
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { 
        cliente: true, 
        messages: {
          orderBy: { createdAt: 'asc' } // Aqui no detalhe traz todas em ordem cronológica
        }
      }
    });
    if (!ticket) throw new NotFoundException(`Ticket #${id} não encontrado`);
    return ticket;
  }

  async update(id: number, updateData: any) {
    // Destruturação para garantir que o ID não seja enviado no corpo do update do Prisma
    const { id: _, ...data } = updateData;
    return this.prisma.ticket.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}