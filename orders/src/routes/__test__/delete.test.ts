import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Rock Concert',
		price: 20,
	});
	await ticket.save();
	return ticket;
};

it('cancels the order', async () => {
	const ticket = await buildTicket();
	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(204);
	const fetchOrder = await Order.findById(order.id);
	expect(fetchOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes event when order is cancelled', async () => {
	const ticket = await buildTicket();
	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(204);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
