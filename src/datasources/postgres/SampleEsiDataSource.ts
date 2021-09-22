import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { GetSampleEsisFilter } from '../../queries/SampleEsiQueries';
import { SampleEsiDataSource } from '../SampleEsiDataSource';
import database from './database';
import { createSampleEsiObject, SampleEsiRecord } from './records';

class PostgresSampleEsiDataSource implements SampleEsiDataSource {
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
}

export default PostgresSampleEsiDataSource;
