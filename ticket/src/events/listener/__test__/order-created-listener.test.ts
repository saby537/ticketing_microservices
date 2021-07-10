import { OrderCreatedListerner } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@ssvtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderCreatedListerner(natsWrapper.client);
	const ticket = Ticket.build({
		title: 'Concert',
		price: 10,
		userId: 'adasd',
	});
	await ticket.save();

	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'adasd',
		expiresAt: 'asd',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('sets the order Id for the ticket', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const updatedTicket = await Ticket.findById(ticket.id);
	expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('creates a ticket updated event', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(ticketUpdatedData.orderId).toEqual(data.id);
});
