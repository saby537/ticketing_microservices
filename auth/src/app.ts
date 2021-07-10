import express from 'express';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUserRouter } from './Routes/current-user';
import { signInRouter } from './Routes/signin';
import { signUpRouter } from './Routes/signup';
import { signOutRouter } from './Routes/signout';
import { errorHandler, NotFoundError } from '@ssvtickets/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);
app.all('*', async () => {
	throw new NotFoundError();
});
app.use(errorHandler);

export { app };
