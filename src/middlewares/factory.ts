import express, { Request } from 'express';

import baseContext from '../buildContext';
import { DownloadType } from '../factory/service';
import { AuthJwtPayload, UserWithRole } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/Logger';
import pdfDownload from './factory/pdf';
import xlsxDownload from './factory/xlsx';

export type RequestWithUser = Request & { user: UserWithRole };

const router = express.Router();

router.use(`/${DownloadType.PDF}`, pdfDownload());
router.use(`/${DownloadType.XLSX}`, xlsxDownload());

export default function factory() {
  return express.Router().use(
    '/download',
    (req, res, next) => {
      const decoded = verifyToken<AuthJwtPayload>(req.cookies.token);

      baseContext.queries.user
        .getAgent(decoded.user.id)
        .then(user => {
          if (!user) {
            return res.status(401).send('Unauthorized');
          }

          (req as RequestWithUser).user = {
            ...user,
            currentRole: decoded.currentRole,
          };
          next();
        })
        .catch(e => {
          logger.logException(
            'Could not download generated the requested file(s)',
            e
          );
          res
            .status(500)
            .send('Could not download generated the requested file(s)');
        });
    },
    router
  );
}
