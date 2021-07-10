import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('returns an error if ticket doesnot exists', async () => {
	const ticketId = new mongoose.Types.ObjectId();
	const response = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId });
	expect(response.status).toEqual(404);
});

it('returns an error if ticket is already reserved', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Rock Concert',
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		userId: 'asdsad',
		ticket,
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});

	await order.save();

	const response = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id });

	expect(response.status).toEqual(400);
});

it('reserves ticket', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Rock Concert',
		price: 20,
	});
	await ticket.save();

	const response = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id });

	expect(response.status).toEqual(201);
});

it('emit an order created event', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Rock Concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
