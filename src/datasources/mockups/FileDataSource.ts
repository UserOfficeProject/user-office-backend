import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../IFileDataSource';

export default class FileDataSourceMock implements FileDataSource {
  prepare(fileId: string, output: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getMetadata(fileIds: string[]): Promise<FileMetadata[]> {
    throw new Error('Method not implemented.');
  }
  put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata> {
    throw new Error('Method not implemented.');
  }
}
