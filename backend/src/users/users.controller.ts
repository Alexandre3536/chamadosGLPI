import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Busca um usuário específico (usado para carregar o avatar no F5)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.usersService.login(body.email, body.senha);
  }

  // ATUALIZAÇÃO DE AVATAR (E outros campos)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // O body aqui receberá { avatar: "string-base64-gigante" }
    return this.usersService.update(Number(id), body);
  }
}