import { BasicUserDetails } from '../models/User';
import { Visit } from '../models/Visit';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { VisitsFilter } from './../resolvers/queries/VisitsQuery';

export interface VisitDataSource {
  // Read
  getVisit(visitId: number): Promise<Visit | null>;
  getVisits(filter?: VisitsFilter): Promise<Visit[]>;
  getTeam(visitId: number): Promise<BasicUserDetails[]>;
  getVisitByScheduledEventId(eventId: number): Promise<Visit | null>;
  // Write
  createVisit(
    proposalPk: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit>;
  updateVisit(args: UpdateVisitArgs): Promise<Visit>;
  deleteVisit(visitId: number): Promise<Visit>;
  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean>;
}
