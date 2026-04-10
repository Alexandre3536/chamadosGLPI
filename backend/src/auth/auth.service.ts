import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // 1. Busca o usuário no banco pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Verifica se o usuário existe
    if (!user || !user.senha) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 3. Compara a senha enviada com o hash do banco
    const senhaValida = await bcrypt.compare(pass, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 4. Gera o Token (Payload)
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
      
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    };
  }
}