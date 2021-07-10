import { OrderCreatedEvent, OrderStatus } from '@ssvtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../model/order';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);
	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		expiresAt: 'asdasd',
		userId: 'adadas',
		ticket: {
			id: 'conert',
			price: 20,
		},
	};
	// @ts-ignore

	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('replicates order info', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const order = await Order.findById(data.id);
	expect(order!.userId).toEqual(data.userId);
	expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});
