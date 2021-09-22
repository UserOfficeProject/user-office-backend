import { Rejection } from '../models/Rejection';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { GetEsisFilter, GetSampleEsisFilter } from '../queries/EsiQueries';
import { CreateEsiArgs } from '../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../resolvers/mutations/UpdateEsiMutation';
import { ExperimentSafetyInput } from './../models/ExperimentSafetyInput';

export interface EsiDataSource {
  // Create
  createEsi(
    args: CreateEsiArgs & { questionaryId: number }
  ): Promise<ExperimentSafetyInput | Rejection>;

  // Read
  getEsi(esiId: number): Promise<ExperimentSafetyInput | null>;
  getEsis(filter: GetEsisFilter): Promise<ExperimentSafetyInput[]>;

  getSampleEsi(
    sampleEsiId: number
  ): Promise<SampleExperimentSafetyInput | null>;
  getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]>;

  // Update
  updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput>;
}
