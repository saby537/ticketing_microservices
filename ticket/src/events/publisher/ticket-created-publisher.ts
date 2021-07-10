import { Publisher, TicketCreatedEvent, Subjects } from '@ssvtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
