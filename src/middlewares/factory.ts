import contentDisposition from 'content-disposition';
import express, { Request as Req, Response } from 'express';
import request from 'request';

import baseContext from '../buildContext';
import { AuthJwtPayload, UserWithRole } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/Logger';
import { collectProposalPDFData } from './factory/pdf/proposal';
import { collectSamplePDFData } from './factory/pdf/sample';
import {
  collectProposalXLSXData,
  defaultProposalDataColumns,
} from './factory/xlsx/proposal';

type Request = Req & { user: UserWithRole };

enum DownloadType {
  PDF = 'pdf',
  XLSX = 'xlsx',
}

enum XLSXType {
  PROPOSAL = 'proposal',
}

enum PDFType {
  PROPOSAL = 'proposal',
  SAMPLE = 'sample',
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT!;

const router = express.Router();

// TODO: move to utils? use moment or luxon?
const utcDateTime = () => new Date().toISOString().replace(/[\.:]/g, '');

const bufferRequestBody = (req: request.Request) =>
  new Promise(resolve => {
    const buffer: Buffer[] = [];

    req.on('data', chunk =>
      buffer.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    );

    req.on('complete', () => resolve(Buffer.concat(buffer).toString()));
  });

type MetaBase = { collectionFilename: string; singleFilename: string };
type XLSXMetaBase = MetaBase & { columns: string[] };

function factoryRequest<TData, TMeta extends MetaBase>(
  downloadType: DownloadType,
  type: PDFType | XLSXType,
  properties: { data: TData[]; meta: TMeta },
  res: Response
) {
  const pdfReq = request
    .post(`${ENDPOINT}/${downloadType}/${type}`, { json: properties })
    .on('response', pdfResp => {
      if (pdfResp.statusCode !== 200) {
        bufferRequestBody(pdfReq)
          .then(body => {
            logger.logError(`Failed to generate ${downloadType}/${type}`, {
              response: body,
              type,
            });
          })
          .catch(err => {
            logger.logException(
              `Failed to generate ${downloadType}/${type} and read response body`,
              err,
              { type }
            );
          });

        res.status(500).send(`Failed to generate ${downloadType}/${type}`);
      } else {
        if (pdfResp.headers['content-type']) {
          res.setHeader('content-type', pdfResp.headers['content-type']);
        }

        res.setHeader(
          'Content-Disposition',
          contentDisposition(
            properties.data.length > 1
              ? properties.meta.collectionFilename
              : properties.meta.singleFilename
          )
        );

        pdfResp.pipe(res);
      }
    })
    .on('error', err => {
      logger.logException(
        `Could not download generated ${downloadType}/${type}`,
        err
      );
      res
        .status(500)
        .send(`Could not download generated ${downloadType}/${type}`);
    });
}

router.get(
  `/${DownloadType.PDF}/${PDFType.PROPOSAL}/:proposal_ids`,
  async (req, res) => {
    try {
      const userWithRole = (req as Request).user;
      const proposalIds: number[] = req.params.proposal_ids
        .split(',')
        .map((n: string) => parseInt(n))
        .filter((id: number) => !isNaN(id));

      const meta: MetaBase = {
        collectionFilename: `proposals_${utcDateTime()}.pdf`,
        singleFilename: '',
      };
      const data = await Promise.all(
        proposalIds.map((proposalId, indx) =>
          collectProposalPDFData(
            proposalId,
            userWithRole,
            (filename: string) => indx === 0 && (meta.singleFilename = filename)
          )
        )
      );

      factoryRequest(DownloadType.PDF, PDFType.PROPOSAL, { data, meta }, res);
    } catch (e) {
      logger.logException('Could not download generated PDF', e);
      res.status(500).send('Could not download generated PDF');
    }
  }
);

router.get(
  `/${DownloadType.PDF}/${PDFType.SAMPLE}/:sample_ids`,
  async (req, res) => {
    try {
      const userWithRole = (req as Request).user;
      const sampleIds: number[] = req.params.sample_ids
        .split(',')
        .map((n: string) => parseInt(n))
        .filter((id: number) => !isNaN(id));

      const meta: MetaBase = {
        collectionFilename: `samples_${utcDateTime()}.pdf`,
        singleFilename: '',
      };
      const data = await Promise.all(
        sampleIds.map((sampleId, indx) =>
          collectSamplePDFData(
            sampleId,
            userWithRole,
            (filename: string) => indx === 0 && (meta.singleFilename = filename)
          )
        )
      );

      factoryRequest(DownloadType.PDF, PDFType.SAMPLE, { data, meta }, res);
    } catch (e) {
      logger.logException('Could not download generated PDF', e);
      res.status(500).send('Could not download generated PDF');
    }
  }
);

router.get(
  `/${DownloadType.XLSX}/${XLSXType.PROPOSAL}/:proposal_ids`,
  async (req, res) => {
    try {
      const userWithRole = (req as Request).user;
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
        collectionFilename: `proposals_${utcDateTime()}.xlsx`,
        columns: defaultProposalDataColumns,
      };

      const data = await Promise.all(
        proposalIds.map((proposalId, indx) =>
          collectProposalXLSXData(
            proposalId,
            userWithRole,
            (filename: string) => indx === 0 && (meta.singleFilename = filename)
          )
        )
      );

      factoryRequest(DownloadType.XLSX, XLSXType.PROPOSAL, { data, meta }, res);
    } catch (e) {
      logger.logException('Could not download generated XLSX', e);
      res.status(500).send('Could not download generated XLSX');
    }
  }
);

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

          (req as Request).user = { ...user, currentRole: decoded.currentRole };
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
