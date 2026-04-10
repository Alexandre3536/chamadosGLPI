import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: number) {
    return this.prisma.ticket.create({
      data: {
        titulo: createTicketDto.titulo,
        descricao: createTicketDto.descricao,
        status: createTicketDto.status || 'ABERTO',
        // O segredo está aqui: usamos o ID que veio do Token
        cliente: {
          connect: { id: userId }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: { cliente: true } // Para ver os dados do dono do ticket
    });
  }

  async findOne(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { cliente: true }
    });
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id }
    });
  }
}