import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ValidateRequest, BadRequestError } from '@ssvtickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();
router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Enter valid Email ID'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('You must supply a Password'),
	],
	ValidateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const existingUser = await User.findOne({ email: email });
		if (!existingUser) {
			throw new BadRequestError('Incorrect Credentials');
		}
		const passwordMatch = await Password.compare(
			existingUser.password,
			password
		);
		if (!passwordMatch) {
			throw new BadRequestError('Incorrect Credentials');
		}
		const userJWT = jwt.sign(
			{
				id: existingUser.id,
				email: existingUser.email,
			},
			process.env.JWT_KEY!
		);
		req.session = { jwt: userJWT };
		res.status(200).send(existingUser);
	}
);

export { router as signInRouter };
