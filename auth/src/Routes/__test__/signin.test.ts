import request from 'supertest';
import { app } from '../../app';

it('fails when email doesnot exist', async () => {
	return request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('fails when incorrect password sent', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	return request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password1',
		})
		.expect(400);
});

it('responds with valid cookie on correct email', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200);

	expect(response.get('Set-Cookie')).toBeDefined();
});
