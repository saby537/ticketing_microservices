import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
	NotFoundError,
	requireAuth,
	ValidateRequest,
	NotAuthorizedError,
	BadRequestError,
} from '@ssvtickets/common';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publisher/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price should be greater than 0'),
	],
	ValidateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) {
			throw new NotFoundError();
		}
		if (ticket.orderId) {
			throw new BadRequestError('Ticket is already reserved');
		}
		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		ticket.set({
			title: req.body.title,
			price: req.body.price,
		});
		await ticket.save();
		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		});
		res.send(ticket);
	}
);

export { router as updateTicketRouter };
