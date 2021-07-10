import { PaymentCreatedEvent, Publisher, Subjects } from '@ssvtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
