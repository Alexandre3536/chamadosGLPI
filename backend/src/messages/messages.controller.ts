import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() data: any) {
    return this.messagesService.create(data);
  }

  @Get('ticket/:ticketId')
  findAllByTicket(@Param('ticketId') ticketId: string) {
    return this.messagesService.findAllByTicket(+ticketId);
  }
}