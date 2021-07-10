import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('return 404 if provided id not found', async () => {
	await request(app)
		.put('/api/tickets/60a570022d9a4f3d00fa7777')
		.set('Cookie', global.signin())
		.send({ title: 'concert', price: 20 })
		.expect(404);
});

it('return 401 if user is not authenticated', async () => {
	await request(app)
		.put('/api/tickets/60a570022d9a4f3d00fa7777')
		.send({ title: 'concert', price: 20 })
		.expect(401);
});

it('return 401 if user is not creator of ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({ title: 'concert', price: 20 });

	//console.log('401: ', response.body.id);
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({ title: 'concert', price: 20 })
		.expect(401);
});

it('return 400 if user provided invalid inputs', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'concert', price: 20 });

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: '', price: 20 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'concert', price: -1 })
		.expect(400);
});

it('return 200 if user provide valid inputs', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'concert', price: 20 });

	//console.log('200: ', response.body.id);
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'concert1', price: 50 })
		.expect(200);

	const ticket = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);
	expect(ticket.body.title).toEqual('concert1');
	expect(ticket.body.price).toEqual(50);
});

it('publishes event on successful update', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'concert', price: 20 });

	//console.log('200: ', response.body.id);
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'concert1', price: 50 })
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if ticket is reserved', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'concert', price: 20 });

	const ticket = await Ticket.findById(response.body.id);
	ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
	await ticket!.save();
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'concert1', price: 50 })
		.expect(400);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
