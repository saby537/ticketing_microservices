import mongoose from 'mongoose';
import { app } from './app';
import { OrderCreatedListerner } from './events/listener/order-created-listener';
import { OrderCancelledListerner } from './events/listener/order-cancelled-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
	console.log('Ticket Service starting up...');
	if (!process.env.JWT_KEY) {
		throw new Error('JWT Key Missing!!!');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('Mongo Uri Missing!!!');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS Cluster Id Missing!!!');
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS Client Id  Missing!!!');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS URL Missing!!!');
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed');
			process.exit();
		});
		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		new OrderCreatedListerner(natsWrapper.client).listen();
		new OrderCancelledListerner(natsWrapper.client).listen();
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error(err);
	}
	app.listen(3000, () => {
		console.log('Listening on Port:3000!');
	});
};

start();
