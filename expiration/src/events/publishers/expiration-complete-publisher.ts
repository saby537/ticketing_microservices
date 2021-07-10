import {
	Subjects,
	ExpirationCompleteEvent,
	Publisher,
} from '@ssvtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
