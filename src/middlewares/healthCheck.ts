import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send();
});

export default function() {
  return router;
}
