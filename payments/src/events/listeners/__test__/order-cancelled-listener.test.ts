import { OrderCancelledEvent, OrderStatus } from '@ssvtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../model/order';

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		price: 20,
		userId: 'adasdad',
		version: 0,
	});
	await order.save();
	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: 'conert',
		},
	};
	// @ts-ignore

	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, data, msg };
};

it('cancels order', async () => {
	const { listener, data, msg, order } = await setup();
	await listener.onMessage(data, msg);
	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.id).toEqual(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});
