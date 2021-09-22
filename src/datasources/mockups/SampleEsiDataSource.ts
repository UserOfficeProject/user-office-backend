import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../../queries/SampleEsiQueries';
import { SampleEsiDataSource } from '../SampleEsiDataSource';

export class SampleEsiDataSourceMock implements SampleEsiDataSource {
  getSampleEsi(
    sampleEsiId: number
  ): Promise<SampleExperimentSafetyInput | null> {
    throw new Error('Method not implemented.');
  }
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    throw new Error('Method not implemented.');
  }
}
