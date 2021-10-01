import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { GetProposalEsisFilter } from '../../queries/ProposalEsiQueries';
import { CreateEsiArgs } from '../../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { ProposalEsiDataSource } from '../ProposalEsiDataSource';

export class ProposalEsiDataSourceMock implements ProposalEsiDataSource {
  // Create
  createEsi(args: CreateEsiArgs): Promise<ExperimentSafetyInput | Rejection> {
    throw new Error('Method not implemented.');
  }

  // Read
  getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    throw new Error('Method not implemented.');
  }
  getEsis(filter: GetProposalEsisFilter): Promise<ExperimentSafetyInput[]> {
    throw new Error('Method not implemented.');
  }

  // Update
  updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput> {
    throw new Error('Method not implemented.');
  }
}
