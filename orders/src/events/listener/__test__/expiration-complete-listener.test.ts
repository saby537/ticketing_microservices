import { Message } from 'node-nats-streaming';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent, OrderStatus } from '@ssvtickets/common';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		userId: 'asdasdasd',
		expiresAt: new Date(),
		status: OrderStatus.Created,
		ticket,
	});
	await order.save();
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};
	return { listener, order, ticket, data, msg };
};

it('updates order status to cancelled', async () => {
	const { listener, order, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits Order cancelled event', async () => {
	const { listener, order, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});
