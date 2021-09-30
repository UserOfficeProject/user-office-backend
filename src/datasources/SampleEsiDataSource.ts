import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../queries/SampleEsiQueries';
import { CreateSampleEsiInput } from '../resolvers/mutations/CreateSampleEsiMutation';
import { DeleteSampleEsiInput } from '../resolvers/mutations/DeleteSampleEsiMutation';
import { UpdateSampleEsiArgs } from '../resolvers/mutations/UpdateSampleEsiMutation';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';

export interface SampleEsiDataSource {
  deleteSampleEsi(
    args: DeleteSampleEsiInput
  ): Promise<SampleExperimentSafetyInput>;
  getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null>;
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]>;
  updateSampleEsi(
    args: UpdateSampleEsiArgs & { questionaryId?: number }
  ): Promise<SampleExperimentSafetyInput>;
  createSampleEsi(
    args: CreateSampleEsiInput & { questionaryId: number }
  ): Promise<SampleExperimentSafetyInput>;
}
