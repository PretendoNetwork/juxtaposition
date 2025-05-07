import express from 'express';

const router = express.Router();

router.get('/healthz', (req, res) => {
	res.status(200).json({
		ok: true
	});
});

export const healthzRouter = router;
