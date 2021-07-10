import { Subjects, Publisher, OrderCancelledEvent } from '@ssvtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
