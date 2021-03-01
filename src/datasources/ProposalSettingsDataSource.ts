import { NextStatusEvent } from '../models/NextStatusEvent';
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
import { AddProposalWorkflowStatusInput } from '../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';

export interface ProposalSettingsDataSource {
  createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus>;
  getProposalStatus(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAllProposalStatuses(): Promise<ProposalStatus[]>;
  updateProposalStatus(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  deleteProposalStatus(proposalStatusId: number): Promise<ProposalStatus>;
  createProposalWorkflow(
    newProposalWorkflowInput: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow>;
  getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null>;
  getProposalWorkflowByCall(callId: number): Promise<ProposalWorkflow | null>;
  getAllProposalWorkflows(): Promise<ProposalWorkflow[]>;
  updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow>;
  deleteProposalWorkflow(proposalWorkflowId: number): Promise<ProposalWorkflow>;
  getProposalWorkflowConnections(
    proposalWorkflowId: number,
    droppableGroupId?: string | undefined,
    byParentGroupId?: boolean | undefined
  ): Promise<ProposalWorkflowConnection[]>;
  getProposalWorkflowConnection(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number
  ): Promise<ProposalWorkflowConnection | null>;
  addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection>;
  updateProposalWorkflowStatuses(
    proposalWorkflowStatuses: ProposalWorkflowConnection[]
  ): Promise<ProposalWorkflowConnection[]>;
  deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number,
    nextProposalStatusId?: number
  ): Promise<ProposalWorkflowConnection>;
  addNextStatusEventsToConnection(
    proposalWorkflowConnectionId: number,
    nextStatusEvents: string[]
  ): Promise<NextStatusEvent[]>;
  getNextStatusEventsByConnectionId(
    proposalWorkflowConnectionId: number
  ): Promise<NextStatusEvent[]>;
}
