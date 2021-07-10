import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ValidateRequest, BadRequestError } from '@ssvtickets/common';
import { body } from 'express-validator';
import { User } from '../models/user';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().withMessage('Please enter a valid Email ID'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password Length should be between 4 and 20 characters'),
	],
	ValidateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			throw new BadRequestError('Email in use');
		}
		const user = User.build({ email, password });
		await user.save();
		const userJWT = jwt.sign(
			{
				id: user.id,
				email: user.email,
			},
			process.env.JWT_KEY!
		);
		req.session = { jwt: userJWT };
		res.status(201).send(user);
	}
);

export { router as signUpRouter };
