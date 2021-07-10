import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@ssvtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
	});
	await ticket.save();

	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		title: 'concert-1',
		price: 20,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: ticket.version + 1,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};
it('finds, updates and saves a ticket', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const updatedTicket = await Ticket.findById(data.id);
	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('doesnot call acks if the event has mismatched version', async () => {
	const { listener, ticket, data, msg } = await setup();
	data.version = 10;
	try {
		await listener.onMessage(data, msg);
	} catch (err) {}

	expect(msg.ack).not.toHaveBeenCalled();
});
