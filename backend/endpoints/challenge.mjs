import express from 'express'

const router = express.Router();
import {getDailyChallenge,completeChallenge,getChallengeStatus} from '../challengeController.mjs';

router.get('/daily', getDailyChallenge);
router.post('/daily/complete', completeChallenge);
router.get('/daily/status/:userId', getChallengeStatus);

export default router;
