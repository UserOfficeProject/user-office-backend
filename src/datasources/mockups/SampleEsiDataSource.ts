import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../../queries/SampleEsiQueries';
import { CreateSampleEsiInput } from '../../resolvers/mutations/CreateSampleEsiMutation';
import { DeleteSampleEsiInput } from '../../resolvers/mutations/DeleteSampleEsiMutation';
import { UpdateSampleEsiArgs } from '../../resolvers/mutations/UpdateSampleEsiMutation';
import { SampleEsiArgs } from '../../resolvers/queries/SampleEsiQuery';
import { SampleEsiDataSource } from '../SampleEsiDataSource';

export class SampleEsiDataSourceMock implements SampleEsiDataSource {
  updateSampleEsi(
    args: UpdateSampleEsiArgs & { questionaryId?: number }
  ): Promise<SampleExperimentSafetyInput> {
    throw new Error('Method not implemented.');
  }

  deleteSampleEsi(
    args: DeleteSampleEsiInput
  ): Promise<SampleExperimentSafetyInput> {
    throw new Error('Method not implemented.');
  }
  createSampleEsi(
    args: CreateSampleEsiInput
  ): Promise<SampleExperimentSafetyInput> {
    throw new Error('Method not implemented.');
  }
  getSampleEsi(
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null> {
    throw new Error('Method not implemented.');
  }
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    throw new Error('Method not implemented.');
  }
}
