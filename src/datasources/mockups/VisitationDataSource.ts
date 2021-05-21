import { BasicUserDetails } from '../../models/User';
import { Visitation } from '../../models/Visitation';
import { UpdateVisitationArgs } from '../../resolvers/mutations/UpdateVisitationMutation';
import { VisitationsFilter } from '../../resolvers/queries/VisitationsQuery';
import { VisitationDataSource } from './../VisitationDataSource';

export class VisitationDataSourceMock implements VisitationDataSource {
  getVisitation(visitationId: number): Promise<Visitation> {
    throw new Error('Method not implemented.');
  }
  getVisitations(filter?: VisitationsFilter): Promise<Visitation[]> {
    throw new Error('Method not implemented.');
  }
  getTeam(visitationId: number): Promise<BasicUserDetails[]> {
    throw new Error('Method not implemented.');
  }
  createVisitation(
    proposalId: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visitation> {
    throw new Error('Method not implemented.');
  }
  updateVisitation(args: UpdateVisitationArgs): Promise<Visitation> {
    throw new Error('Method not implemented.');
  }
  deleteVisitation(visitationId: number): Promise<Visitation> {
    throw new Error('Method not implemented.');
  }
}
