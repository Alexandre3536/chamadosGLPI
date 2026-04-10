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

  async findAll() {
    return this.prisma.ticket.findMany({
      include: { 
        cliente: true,
        messages: true 
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  // ESSA É A FUNÇÃO QUE O SEU ERRO ESTÁ PEDINDO!
  async update(id: number, updateData: any) {
    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { cliente: true, messages: true }
    });
    if (!ticket) throw new NotFoundException(`Ticket #${id} não encontrado`);
    return ticket;
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}