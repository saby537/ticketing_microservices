import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../model/order';
import Mongoose from 'mongoose';
import { stripe } from '../../stripe';
import { Payment } from '../../model/payment';
//jest.mock('../../stripe');

it('returns 404 if order doesnot exists', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			orderId: Mongoose.Types.ObjectId().toHexString(),
			token: 'adasdasd',
		})
		.expect(404);
});

it('returns 401 if purchasing order doesnot belong to user', async () => {
	const order = Order.build({
		id: Mongoose.Types.ObjectId().toHexString(),
		userId: Mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			orderId: order.id,
			token: 'adasdasd',
		})
		.expect(401);
});

it('returns 400 if purchasing order is cancelled', async () => {
	const userId = Mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: Mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			orderId: order.id,
			token: 'adasdasd',
		})
		.expect(400);
});

it('returns 201 with valid inputs', async () => {
	const userId = Mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: Mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			orderId: order.id,
			token: 'tok_visa',
		})
		.expect(201);
	const stripeCharges = await stripe.charges.list({ limit: 50 });
	const stripeCharge = stripeCharges.data.find(
		(charge) => charge.amount === order.price * 100
	);
	expect(stripeCharge).toBeDefined();

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	});

	expect(payment).not.toBeNull();
	// const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	// expect(chargeOptions.source).toEqual('tok_visa');
	// expect(chargeOptions.amount).toEqual(order.price * 100);
	// expect(chargeOptions.currency).toEqual('usd');
});
