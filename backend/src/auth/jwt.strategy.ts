import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CHAVE_SUPER_SECRETA_DO_ALEXANDRE', // A mesma do AuthModule
    });
  }

  async validate(payload: any) {
    // O que retornarmos aqui ficará disponível no 'req.user' de todas as rotas
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}