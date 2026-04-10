import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // Adicione este
import { JwtStrategy } from './jwt.strategy';     // Adicione este

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'CHAVE_SUPER_SECRETA_DO_ALEXANDRE',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // Adicione o JwtStrategy aqui
  controllers: [AuthController],
})
export class AuthModule {}