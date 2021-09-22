import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../queries/SampleEsiQueries';

export interface SampleEsiDataSource {
  getSampleEsi(
    sampleEsiId: number
  ): Promise<SampleExperimentSafetyInput | null>;
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]>;
}
