import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Criação de usuário com Hash de senha
  async create(data: any) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.senha, salt);

    return this.prisma.user.create({
      data: {
        ...data,
        senha: hashedPassword,
      },
    });
  }

  // Lista todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  // Busca um usuário pelo ID (Essencial para carregar o Avatar no Frontend)
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { senha, ...result } = user;
    return result;
  }

  // Lógica de Login
  async login(email: string, senhaPlana: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaPlana, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const { senha, ...result } = user;
    return result;
  }

  // Atualização (Onde a mágica do Avatar e imagens de 5MB acontece)
  async update(id: number, data: any) {
    const updateData = { ...data };

    // Se estiver tentando atualizar a senha, gera um novo hash
    if (data.senha) {
      const salt = await bcrypt.genSalt();
      updateData.senha = await bcrypt.hash(data.senha, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}

