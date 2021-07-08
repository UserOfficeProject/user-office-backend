import { UserVisit } from '../models/UserVisit';
import { Visit } from '../models/Visit';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { CreateVisitArgs } from './../resolvers/mutations/CreateVisitMutation';
import { VisitsFilter } from './../resolvers/queries/VisitsQuery';

export interface VisitDataSource {
  // Read
  getVisit(visitId: number): Promise<Visit | null>;
  getVisits(filter?: VisitsFilter): Promise<Visit[]>;
  getUserVisits(visitId: number): Promise<UserVisit[]>;
  getVisitByScheduledEventId(eventId: number): Promise<Visit | null>;
  // Write
  createVisit(
    args: CreateVisitArgs,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit>;
  updateVisit(args: UpdateVisitArgs): Promise<Visit>;
  deleteVisit(visitId: number): Promise<Visit>;
  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean>;
}
