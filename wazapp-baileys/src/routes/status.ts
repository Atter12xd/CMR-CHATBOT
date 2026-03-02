import { Router } from 'express';
import { sessionManager } from '../index.js';

export const statusRouter = Router();

statusRouter.get('/', (req, res) => {
  res.json({
    sessions: sessionManager.getActiveSessions().length,
    list: sessionManager.getActiveSessions()
  });
});
