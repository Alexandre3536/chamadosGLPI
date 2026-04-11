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
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!ticket) throw new NotFoundException(`Ticket #${id} não encontrado`);
    return ticket;
  }

  async update(id: number, updateData: any) {
    /**
     * AQUI ESTÁ A MUDANÇA:
     * Extraímos 'id' e 'avaliacao' (que causava o erro) do updateData.
     * O resto dos campos válidos ficam na constante 'data'.
     */
    const { id: _, avaliacao, cliente, messages, ...data } = updateData;

    return this.prisma.ticket.update({
      where: { id: Number(id) },
      data: data, // O Prisma agora só recebe campos que ele conhece
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id: Number(id) },
    });
  }
}