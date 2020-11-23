import express from 'express';

import baseContext from '../../buildContext';
import callFactoryService, {
  DownloadType,
  XLSXType,
  XLSXMetaBase,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import {
  collectProposalXLSXData,
  defaultProposalDataColumns,
} from '../../factory/xlsx/proposal';
import { logger } from '../../utils/Logger';
import { RequestWithUser } from '../factory';

const router = express.Router();

router.get(`/${XLSXType.PROPOSAL}/:proposal_ids`, async (req, res) => {
  try {
    const userWithRole = (req as RequestWithUser).user;
    const proposalIds: number[] = req.params.proposal_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const userAuthorization = baseContext.userAuthorization;

    if (!userAuthorization.isUserOfficer(userWithRole)) {
      throw new Error('User has insufficient rights');
    }
    const meta: XLSXMetaBase = {
      singleFilename: '',
      collectionFilename: `proposals_${getCurrentTimestamp()}.xlsx`,
      columns: defaultProposalDataColumns,
    };

    const data = await Promise.all(
      proposalIds.map((proposalId, indx) =>
        collectProposalXLSXData(
          proposalId,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    callFactoryService(
      DownloadType.XLSX,
      XLSXType.PROPOSAL,
      { data, meta },
      res
    );
  } catch (e) {
    logger.logException('Could not download generated XLSX', e);
    res.status(500).send('Could not download generated XLSX');
  }
});

export default function xlsxDownload() {
  return router;
}
