import contentDisposition from 'content-disposition';
import { Response } from 'express';
import request from 'request';

import { logger } from '../utils/Logger';
import { bufferRequestBody } from './util';

export enum DownloadType {
  PDF = 'pdf',
  XLSX = 'xlsx',
}

export enum XLSXType {
  PROPOSAL = 'proposal',
  SEP = 'sep',
}

export enum PDFType {
  PROPOSAL = 'proposal',
  SAMPLE = 'sample',
}

export type MetaBase = { collectionFilename: string; singleFilename: string };
export type XLSXMetaBase = MetaBase & { columns: string[] };

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT!;

export default function callFactoryService<TData, TMeta extends MetaBase>(
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

        const filename =
          properties.data.length > 1
            ? properties.meta.collectionFilename
            : properties.meta.singleFilename;

        res.setHeader('Content-Disposition', contentDisposition(filename));

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
