import { UserVisit } from '../models/UserVisit';
import { Visit } from '../models/Visit';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../resolvers/mutations/UpdateVisitRegistration';
import { CreateVisitArgs } from './../resolvers/mutations/CreateVisitMutation';
import { VisitsFilter } from './../resolvers/queries/VisitsQuery';

export interface VisitDataSource {
  // Read
  getVisit(visitId: number): Promise<Visit | null>;
  getVisits(filter?: VisitsFilter): Promise<Visit[]>;
  getUserVisit(user_id: number, visitId: number): Promise<UserVisit | null>;
  getUserVisits(visitId: number): Promise<UserVisit[]>;
  getVisitByScheduledEventId(eventId: number): Promise<Visit | null>;
  getRegistrations(filter: { questionaryIds: number[] }): Promise<UserVisit[]>;
  // Write
  createVisit(args: CreateVisitArgs, creatorId: number): Promise<Visit>;
  updateVisit(args: UpdateVisitArgs): Promise<Visit>;
  updateVisitRegistration(
    userId: number,
    args: UpdateVisitRegistrationArgs
  ): Promise<UserVisit>;
  deleteVisit(visitId: number): Promise<Visit>;
  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean>;
  isVisitorOfVisit(visitorId: number, visitId: number): Promise<boolean>;
}
