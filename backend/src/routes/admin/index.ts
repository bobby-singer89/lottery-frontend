import { Router } from 'express';
import authRouter from './auth';
import statsRouter from './stats';
import lotteriesRouter from './lotteries';
import drawsRouter from './draws'; // Already exists
import payoutsRouter from './payouts';
import financeRouter from './finance'; // Already exists

const router = Router();

router.use('/auth', authRouter);
router.use('/stats', statsRouter);
router.use('/lotteries', lotteriesRouter);
router.use('/draws', drawsRouter);
router.use('/payouts', payoutsRouter);
router.use('/finance', financeRouter);

export default router;
