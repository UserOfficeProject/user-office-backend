import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createMessageBrokerHandler from './messageBroker';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers() {
  return [
    createEmailHandler(),
    createLoggingHandler(),
    createMessageBrokerHandler(),
    createProposalWorkflowHandler(),
  ];
}
