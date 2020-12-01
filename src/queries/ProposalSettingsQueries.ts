import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized } from '../decorators';
import { Event, EventLabel } from '../events/event.enum';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

export default class ProposalSettingsQueries {
  constructor(public dataSource: ProposalSettingsDataSource) {}

  @Authorized()
  async getProposalStatus(agent: UserWithRole | null, id: number) {
    const proposalStatus = await this.dataSource.getProposalStatus(id);

    return proposalStatus;
  }

  @Authorized()
  async getAllProposalStatuses(agent: UserWithRole | null) {
    const proposalStatuses = await this.dataSource.getAllProposalStatuses();

    return proposalStatuses;
  }

  async getProposalWorkflow(agent: UserWithRole | null, id: number) {
    const proposalWorkflow = await this.dataSource.getProposalWorkflow(id);

    return proposalWorkflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalWorkflows(agent: UserWithRole | null) {
    const proposalWorkflows = await this.dataSource.getAllProposalWorkflows();

    return proposalWorkflows;
  }

  getUniqueDroppableGroupIds(list: ProposalWorkflowConnection[]) {
    const flags = new Set();

    return (
      list
        .map(item => ({
          droppableGroupId: item.droppableGroupId,
          prevProposalStatusId: item.prevProposalStatusId,
        }))
        // remove duplicates
        .filter(item => {
          if (flags.has(item.droppableGroupId)) {
            return false;
          }
          flags.add(item.droppableGroupId);

          return true;
        })
    );
  }

  groupProposalWorkflowConnectionsByDroppableArea(
    proposalWorkflowConnections: ProposalWorkflowConnection[]
  ) {
    const groupedProposalWorkflowConnections = this.getUniqueDroppableGroupIds(
      proposalWorkflowConnections
    ).map(item => ({
      groupId: item.droppableGroupId,
      parentGroupId:
        proposalWorkflowConnections.find(
          element => element.proposalStatusId === item.prevProposalStatusId
        )?.droppableGroupId || null,
      connections: proposalWorkflowConnections.filter(
        proposalWorkflowConnection =>
          proposalWorkflowConnection.droppableGroupId === item.droppableGroupId
      ),
    }));

    return groupedProposalWorkflowConnections;
  }

  @Authorized([Roles.USER_OFFICER])
  async proposalWorkflowConnectionGroups(
    agent: UserWithRole | null,
    proposalWorkflowId: number
  ) {
    const proposalWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
      proposalWorkflowId
    );

    const groupedProposalWorkflowConnections = this.groupProposalWorkflowConnectionsByDroppableArea(
      proposalWorkflowConnections
    );

    return groupedProposalWorkflowConnections;
  }

  @Authorized([Roles.USER_OFFICER])
  async getNextStatusEventsByConnectionId(
    agent: UserWithRole | null,
    proposalWorkflowConnectionId: number
  ) {
    const nextStatusEvents = await this.dataSource.getNextStatusEventsByConnectionId(
      proposalWorkflowConnectionId
    );

    return nextStatusEvents;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalEvents(agent: UserWithRole | null) {
    const allEventsArray = Object.values(Event);
    const allProposalEvents = allEventsArray
      .filter(
        eventItem =>
          eventItem.startsWith('PROPOSAL_') || eventItem.startsWith('CALL')
      )
      .map(eventItem => ({
        name: eventItem,
        description: EventLabel.get(eventItem),
      }));

    return allProposalEvents;
  }
}
