import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
	namespace NodeJS {
		interface Global {
			signin(id?: string): string[];
		}
	}
}

jest.mock('../nats-wrapper.ts');
process.env.STRIPE_KEY =
	'sk_test_51HHwGzBrhswYPyxghXndE5p0gWcfVr2MEAx1n2UE2KeMM6Fzt0IXtvQxbakIs6nmAMxybG0KUAZRJkVZt4dVkvAc00ambk3ni6';

let mongo: any;
beforeAll(async () => {
	jest.clearAllMocks();
	process.env.JWT_KEY = 'asdasdasd';
	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signin = (id?: string) => {
	const payload = {
		id: id || new mongoose.Types.ObjectId().toHexString(),
		email: 'test@gmail.com',
	};
	const token = jwt.sign(payload, process.env.JWT_KEY!);
	const session = { jwt: token };
	const sessionJSON = JSON.stringify(session);
	const base64 = Buffer.from(sessionJSON).toString('base64');
	return [`express:sess=${base64}`];
};
