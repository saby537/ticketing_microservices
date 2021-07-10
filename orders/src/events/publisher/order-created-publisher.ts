import { Subjects, Publisher, OrderCreatedEvent } from '@ssvtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
