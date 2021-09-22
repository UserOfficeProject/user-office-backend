import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetEsisFilter, GetSampleEsisFilter } from '../../queries/EsiQueries';
import { CreateEsiArgs } from '../../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { EsiDataSource } from './../EsiDataSource';
import database from './database';
import {
  createEsiObject,
  createSampleEsiObject,
  EsiRecord,
  SampleEsiRecord,
} from './records';

class PostgresEsiDataSource implements EsiDataSource {
  async createEsi(
    args: CreateEsiArgs & { questionaryId: number }
  ): Promise<ExperimentSafetyInput | Rejection> {
    return database
      .insert({
        visit_id: args.visitId,
        questionary_id: args.questionaryId,
      })
      .into('experiment_safety_inputs')
      .returning('*')
      .then((result) => createEsiObject(result[0]));
  }

  async getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    const result = await database
      .select('*')
      .from('experiment_safety_inputs')
      .where('esi_id', esiId)
      .first();

    return createEsiObject(result);
  }

  async getEsis(filter: GetEsisFilter): Promise<ExperimentSafetyInput[]> {
    const esis: EsiRecord[] = await database
      .select('*')
      .from('experiment_safety_inputs')
      .modify((query) => {
        if (filter.visitId) {
          query.where('visit_id', filter.visitId);
        }
      });

    return esis.map((esi) => createEsiObject(esi));
  }

  async getSampleEsi(
    sampleEsiId: number
  ): Promise<SampleExperimentSafetyInput | null> {
    const result = await database
      .select('*')
      .from('sample_experiment_safety_inputs')
      .where('sample_esi_id', sampleEsiId)
      .first();

    return createSampleEsiObject(result);
  }
  async getSampleEsis(
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    const esis: SampleEsiRecord[] = await database
      .select('*')
      .from('sample_experiment_safety_inputs')
      .modify((query) => {
        if (filter.visitId) {
          query.where('visit_id', filter.visitId);
        }
        if (filter.sampleId) {
          query.where('sample_id', filter.sampleId);
        }
      });

    return esis.map((esi) => createSampleEsiObject(esi));
  }

  async updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput> {
    return database('experiment_safety_inputs')
      .update({
        is_submitted: args.isSubmitted,
      })
      .where('esiId', args.esiId)
      .returning('*')
      .first()
      .then((result: EsiRecord) => createEsiObject(result));
  }
}

export default PostgresEsiDataSource;
