import { ProposalEndStatus } from './Proposal';

export class SepMeetingDecision {
  constructor(
    public proposalId: number,
    public rankOrder: number,
    public recommendation: ProposalEndStatus,
    public commentForUser: string,
    public commentForManagement: string,
    public submitted: boolean,
    public submittedBy: number | null
  ) {}
}
