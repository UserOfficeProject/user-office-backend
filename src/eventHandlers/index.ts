import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createMessageBrokerHandler from './messageBroker';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers({
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDataSource,
  proposalDataSource,
  proposalSettingsDataSource,
}: {
  userDataSource: UserDataSource;
  eventLogsDataSource: EventLogsDataSource;
  reviewDataSource: ReviewDataSource;
  instrumentDataSource: InstrumentDataSource;
  proposalDataSource: ProposalDataSource;
  proposalSettingsDataSource: ProposalSettingsDataSource;
}) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(eventLogsDataSource),
    createMessageBrokerHandler({
      instrumentDataSource,
      proposalSettingsDataSource,
    }),
    createProposalWorkflowHandler(proposalDataSource, reviewDataSource),
  ];
}
