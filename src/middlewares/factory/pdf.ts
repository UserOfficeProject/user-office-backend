import express from 'express';

import { collectProposalPDFData } from '../../factory/pdf/proposal';
import { collectSamplePDFData } from '../../factory/pdf/sample';
import callFactoryService, {
  DownloadType,
  PDFType,
  MetaBase,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import { logger } from '../../utils/Logger';
import { RequestWithUser } from '../factory';

const router = express.Router();

router.get(`/${PDFType.PROPOSAL}/:proposal_ids`, async (req, res) => {
  try {
    const userWithRole = (req as RequestWithUser).user;
    const proposalIds: number[] = req.params.proposal_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const meta: MetaBase = {
      collectionFilename: `proposals_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };
    const data = await Promise.all(
      proposalIds.map((proposalId, indx) =>
        collectProposalPDFData(
          proposalId,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    callFactoryService(DownloadType.PDF, PDFType.PROPOSAL, { data, meta }, res);
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send('Could not download generated PDF');
  }
});

router.get(`/${PDFType.SAMPLE}/:sample_ids`, async (req, res) => {
  try {
    const userWithRole = (req as RequestWithUser).user;
    const sampleIds: number[] = req.params.sample_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const meta: MetaBase = {
      collectionFilename: `samples_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };
    const data = await Promise.all(
      sampleIds.map((sampleId, indx) =>
        collectSamplePDFData(
          sampleId,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    callFactoryService(DownloadType.PDF, PDFType.SAMPLE, { data, meta }, res);
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send('Could not download generated PDF');
  }
});

export default function pdfDownload() {
  return router;
}
