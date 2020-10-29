import { NextStatusEvent } from '../../models/NextStatusEvent';
import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../../models/ProposalWorkflowConnections';
import { AddProposalWorkflowStatusInput } from '../../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatus = new ProposalStatus(
  1,
  'DRAFT',
  'When proposal is created it gets draft status before it is submitted.'
);

export const anotherDummyProposalStatus = new ProposalStatus(
  11,
  'NEW_PROPOSAL_STATUS',
  'Proposal status for testing.'
);

export const dummyProposalWorkflow = new ProposalWorkflow(
  1,
  'Test workflow',
  'This is description'
);

export const dummyProposalWorkflowConnection = new ProposalWorkflowConnection(
  1,
  1,
  1,
  1,
  {
    id: 1,
    name: 'TEST_STATUS',
    description: 'Test status',
  },
  null,
  null,
  'proposalWorkflowConnections_0',
  null
);

export const anotherDummyProposalWorkflowConnection = new ProposalWorkflowConnection(
  2,
  2,
  1,
  2,
  {
    id: 2,
    name: 'TEST_STATUS_2',
    description: 'Test status 2',
  },
  null,
  1,
  'proposalWorkflowConnections_0',
  null
);

export const dummyNextStatusEvent = new NextStatusEvent(
  1,
  1,
  'PROPOSAL_SUBMITTED'
);

export class ProposalSettingsDataSourceMock
  implements ProposalSettingsDataSource {
  async createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }

  async getProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus | null> {
    return dummyProposalStatus;
  }

  async getAllProposalStatuses(): Promise<ProposalStatus[]> {
    return [dummyProposalStatus];
  }

  async updateProposalStatus(
    proposalStatus: ProposalStatus
  ): Promise<ProposalStatus> {
    return proposalStatus;
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    return anotherDummyProposalStatus;
  }

  async createProposalWorkflow(
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflowByCall(
    callId: number
  ): Promise<ProposalWorkflow | null> {
    return dummyProposalWorkflow;
  }

  async getAllProposalWorkflows(): Promise<ProposalWorkflow[]> {
    return [dummyProposalWorkflow];
  }

  async updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async deleteProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflowConnections(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflowConnection[]> {
    return [
      dummyProposalWorkflowConnection,
      anotherDummyProposalWorkflowConnection,
    ];
  }

  async getProposalWorkflowConnection(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number
  ): Promise<ProposalWorkflowConnection | null> {
    return dummyProposalWorkflowConnection;
  }

  async addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection> {
    return dummyProposalWorkflowConnection;
  }

  async updateProposalWorkflowStatuses(
    proposalWorkflowStatuses: ProposalWorkflowConnection[]
  ): Promise<ProposalWorkflowConnection[]> {
    return [dummyProposalWorkflowConnection];
  }

  async deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number
  ): Promise<ProposalWorkflowConnection> {
    return dummyProposalWorkflowConnection;
  }

  async addNextStatusEventsToConnection(
    proposalWorkflowConnectionId: number,
    nextStatusEvents: string[]
  ): Promise<NextStatusEvent[]> {
    return [dummyNextStatusEvent];
  }

  async getNextStatusEventsByConnectionId(
    proposalWorkflowConnectionId: number
  ): Promise<NextStatusEvent[]> {
    return [dummyNextStatusEvent];
  }
}
