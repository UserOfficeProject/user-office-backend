import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetEsisFilter, GetSampleEsisFilter } from '../../queries/EsiQueries';
import { CreateEsiArgs } from '../../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { EsiDataSource } from '../EsiDataSource';

export class EsiDataSourceMock implements EsiDataSource {
  updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput> {
    throw new Error('Method not implemented.');
  }
  createEsi(args: CreateEsiArgs): Promise<ExperimentSafetyInput | Rejection> {
    throw new Error('Method not implemented.');
  }
  getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    throw new Error('Method not implemented.');
  }

  getEsis(filter: GetEsisFilter): Promise<ExperimentSafetyInput[]> {
    throw new Error('Method not implemented.');
  }

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
