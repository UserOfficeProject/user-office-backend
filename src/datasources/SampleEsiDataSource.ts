import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../queries/SampleEsiQueries';
import { CloneSampleEsiInput } from '../resolvers/mutations/CloneSampleEsiMutation';
import { CreateSampleEsiInput } from '../resolvers/mutations/CreateSampleEsiMutation';
import { DeleteSampleEsiInput } from '../resolvers/mutations/DeleteSampleEsiMutation';
import { UpdateSampleEsiArgs } from '../resolvers/mutations/UpdateSampleEsiMutation';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';

export interface SampleEsiDataSource {
  // Create
  createSampleEsi(
    args: CreateSampleEsiInput & { questionaryId: number }
  ): Promise<SampleExperimentSafetyInput>;
  cloneSampleEsi(
    args: CloneSampleEsiInput
  ): Promise<SampleExperimentSafetyInput>;

  // Read
  getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null>;
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]>;

  // Update
  updateSampleEsi(
    args: UpdateSampleEsiArgs & { questionaryId?: number }
  ): Promise<SampleExperimentSafetyInput>;

  // Delete
  deleteSampleEsi(
    args: DeleteSampleEsiInput
  ): Promise<SampleExperimentSafetyInput>;
}
