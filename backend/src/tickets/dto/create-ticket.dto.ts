
export class CreateTicketDto {
  titulo: string;
  descricao: string;
  status?: string; // O '?' indica que é opcional
}