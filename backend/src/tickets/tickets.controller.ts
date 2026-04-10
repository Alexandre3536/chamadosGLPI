import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common'; // Adicionamos Patch e Param aqui
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() data: any) {
    return this.ticketsService.create(data);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  // Rota para atualizar o status (ex: fechar o chamado)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    // O sinal de + antes do id serve para converter a string em número
    return this.ticketsService.update(+id, updateData);
  } 
}