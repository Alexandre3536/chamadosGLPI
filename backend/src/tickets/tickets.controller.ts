import { Controller, Post, Body, Get, Patch, Param, Query, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() data: any) {
    return this.ticketsService.create(data);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    // Crucial: Converte a query string para número antes de mandar pro Service
    return this.ticketsService.findAll(userId ? Number(userId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.ticketsService.update(Number(id), updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(Number(id));
  }
}