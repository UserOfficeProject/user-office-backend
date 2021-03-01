import { existsSync, mkdirSync } from 'fs';

import { logger } from '@esss-swap/duo-logger';

import { FileDataSource } from '../datasources/IFileDataSource';
import { FileMetadata } from '../models/Blob';
import { Rejection, rejection } from '../rejection';

export default class FileMutations {
  constructor(private dataSource: FileDataSource) {}

  async put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata | Rejection> {
    return this.dataSource
      .put(fileName, mimeType, sizeImBytes, path)
      .then((metadata) => metadata)
      .catch((err) => {
        logger.logException('Could not save file', err, { fileName, path });

        return rejection('INTERNAL_ERROR');
      });
  }

  async prepare(fileId: string): Promise<string | Rejection> {
    const DOWNLOADS_DIR = 'downloads';
    if (!existsSync(DOWNLOADS_DIR)) {
      mkdirSync(DOWNLOADS_DIR);
    }
    const filePath = `${DOWNLOADS_DIR}/${fileId}`;

    return this.dataSource
      .prepare(fileId, filePath)
      .then(() => filePath)
      .catch((err) => {
        logger.logException('Could not prepare file', err, { fileId });

        return rejection('INTERNAL_ERROR');
      });
  }
}
