import { Ticket } from '../ticket';

it('implements optimistic concurreny control', async (done) => {
	const ticket = Ticket.build({
		title: 'Concert',
		price: 10,
		userId: 'test123',
	});
	await ticket.save();

	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	firstInstance!.set({ price: 15 });
	secondInstance!.set({ price: 15 });

	await firstInstance!.save();
	try {
		await secondInstance!.save();
	} catch (err) {
		return done();
	}
	throw new Error('Shouldnot react this point');
});

it('increements version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'Concert',
		price: 10,
		userId: 'test123',
	});
	await ticket.save();
	expect(ticket.version).toEqual(0);
	await ticket.save();
	expect(ticket.version).toEqual(1);
	await ticket.save();
	expect(ticket.version).toEqual(2);
});
