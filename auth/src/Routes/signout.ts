import express from 'express';
import { isNonNullExpression } from 'typescript';
const router = express.Router();

router.post('/api/users/signout', (req, res) => {
	req.session = null;
	res.send({});
});

export { router as signOutRouter };
