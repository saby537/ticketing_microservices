import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
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

it('fetches the order', async () => {
	const ticket = await buildTicket();
	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(200);

	expect(fetchOrder.id).toEqual(order.id);
	expect(fetchOrder.ticket.id).toEqual(ticket.id);
});

it('returns error if fetches the order of another user', async () => {
	const ticket = await buildTicket();
	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', global.signin())
		.expect(401);
});
