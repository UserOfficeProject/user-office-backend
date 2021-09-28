import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../queries/SampleEsiQueries';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';

export interface SampleEsiDataSource {
  getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null>;
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]>;
}
