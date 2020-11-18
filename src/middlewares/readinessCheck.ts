import express, { Request, Response } from 'express';

import baseContext from '../buildContext';
import { logger } from '../utils/Logger';

const router = express.Router();

router.get('/readinessz', (req: Request, res: Response) => {
  baseContext.queries.system
    .connectivityCheck()
    .then(success => {
      success ? res.status(200) : res.status(500);
      res.end();
    })
    .catch(e => {
      logger.logException('Readiness check failed', e);
      res.status(500).end();
    });
});

export default function() {
  return router;
}
