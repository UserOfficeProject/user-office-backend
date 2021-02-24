// NOTE: When creating new event we need to follow the same name standardization/convention: [WHERE]_[WHAT]
export enum Event {
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_UPDATED = 'PROPOSAL_UPDATED',
  PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
  PROPOSAL_FEASIBLE = 'PROPOSAL_FEASIBLE',
  PROPOSAL_SEP_SELECTED = 'PROPOSAL_SEP_SELECTED',
  PROPOSAL_INSTRUMENT_SELECTED = 'PROPOSAL_INSTRUMENT_SELECTED',
  PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED = 'PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_REVIEW_SUBMITTED = 'PROPOSAL_SAMPLE_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_SAFE = 'PROPOSAL_SAMPLE_SAFE',
  PROPOSAL_ALL_SEP_REVIEWERS_SELECTED = 'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
  PROPOSAL_SEP_REVIEW_SUBMITTED = 'PROPOSAL_SEP_REVIEW_SUBMITTED',
  PROPOSAL_SEP_MEETING_SUBMITTED = 'PROPOSAL_SEP_MEETING_SUBMITTED',
  PROPOSAL_MANAGEMENT_DECISION_SUBMITTED = 'PROPOSAL_MANAGEMENT_DECISION_SUBMITTED',
  PROPOSAL_INSTRUMENT_SUBMITTED = 'PROPOSAL_INSTRUMENT_SUBMITTED',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
  CALL_ENDED = 'CALL_ENDED',
  CALL_REVIEW_ENDED = 'CALL_REVIEW_ENDED',
  CALL_SEP_REVIEW_ENDED = 'CALL_SEP_REVIEW_ENDED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_PASSWORD_RESET_EMAIL = 'USER_PASSWORD_RESET_EMAIL',
  EMAIL_INVITE = 'EMAIL_INVITE',
  SEP_CREATED = 'SEP_CREATED',
  SEP_UPDATED = 'SEP_UPDATED',
  SEP_MEMBERS_ASSIGNED = 'SEP_MEMBERS_ASSIGNED',
  SEP_MEMBER_REMOVED = 'SEP_MEMBER_REMOVED',
  SEP_PROPOSAL_REMOVED = 'SEP_PROPOSAL_REMOVED',
  SEP_MEMBER_ASSIGNED_TO_PROPOSAL = 'SEP_MEMBER_ASSIGNED_TO_PROPOSAL',
  SEP_MEMBER_REMOVED_FROM_PROPOSAL = 'SEP_MEMBER_REMOVED_FROM_PROPOSAL',
  PROPOSAL_NOTIFIED = 'PROPOSAL_NOTIFIED',
}

export const EventLabel = new Map<Event, string>([
  [Event.PROPOSAL_CREATED, 'Event occurs when proposal is created'],
  [Event.PROPOSAL_UPDATED, 'Event occurs when proposal is updated'],
  [Event.PROPOSAL_SUBMITTED, 'Event occurs when proposal is submitted'],
  [
    Event.PROPOSAL_FEASIBLE,
    'Event occurs when proposal feasibility review is submitted with value of feasible',
  ],
  [
    Event.PROPOSAL_SEP_SELECTED,
    'Event occurs when SEP gets assigned to a proposal',
  ],
  [
    Event.PROPOSAL_INSTRUMENT_SELECTED,
    'Event occurs when instrument gets assigned to a proposal',
  ],
  [
    Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED,
    'Event occurs when proposal feasibility review is submitted with any value',
  ],
  [
    Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED,
    'Event occurs when proposal sample review gets submitted with any value',
  ],
  [
    Event.PROPOSAL_SAMPLE_SAFE,
    'Event occurs when proposal sample review gets submitted with value of low risk',
  ],
  [
    Event.PROPOSAL_ALL_SEP_REVIEWERS_SELECTED,
    'Event occurs when all SEP reviewers are selected on a proposal',
  ],
  [
    Event.PROPOSAL_SEP_REVIEW_SUBMITTED,
    'Event occurs when SEP review is submitted',
  ],
  [
    Event.PROPOSAL_SEP_MEETING_SUBMITTED,
    'Event occurs when SEP meeting is submitted on a proposal',
  ],
  [
    Event.PROPOSAL_INSTRUMENT_SUBMITTED,
    'Event occurs when instrument is submitted after SEP meeting is finalized',
  ],
  [
    Event.PROPOSAL_ACCEPTED,
    'Event occurs when proposal gets final decision as accepted',
  ],
  [
    Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED,
    'Event occurs when proposal management decision is submitted',
  ],
  [Event.PROPOSAL_REJECTED, 'Event occurs when proposal gets rejected'],
  [
    Event.CALL_ENDED,
    'Event occurs on a specific call end date set on the call',
  ],
  [
    Event.CALL_REVIEW_ENDED,
    'Event occurs on a specific call review end date set on the call',
  ],
  [
    Event.CALL_SEP_REVIEW_ENDED,
    'Event occurs on a specific call SEP review end date set on the call',
  ],
  [Event.USER_CREATED, 'Event occurs when user is created'],
  [Event.USER_UPDATED, 'Event occurs when user is updated'],
  [Event.USER_ROLE_UPDATED, 'Event occurs when user roles are updated'],
  [Event.USER_DELETED, 'Event occurs when user is removed'],
  [
    Event.USER_PASSWORD_RESET_EMAIL,
    'Event occurs when user password is reset by email',
  ],
  [Event.EMAIL_INVITE, 'Event occurs when user is created using email invite'],
  [Event.SEP_CREATED, 'Event occurs when SEP is created'],
  [Event.SEP_UPDATED, 'Event occurs when SEP is updated'],
  [Event.SEP_MEMBERS_ASSIGNED, 'Event occurs when we assign member/s to a SEP'],
  [
    Event.SEP_MEMBER_REMOVED,
    'Event occurs when SEP member gets removed from the panel',
  ],
  [
    Event.SEP_PROPOSAL_REMOVED,
    'Event occurs when proposal is removed from a SEP',
  ],
  [
    Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL,
    'Event occurs when SEP member gets assigned to a proposal for a review',
  ],
  [
    Event.SEP_MEMBER_REMOVED_FROM_PROPOSAL,
    'Event occurs when SEP member is removed from proposal for review',
  ],
  [Event.PROPOSAL_NOTIFIED, 'Event occurs when proposal is notified'],
]);
