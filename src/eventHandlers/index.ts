import { ApplicationEvent } from '../events/applicationEvents';
import { EventHandler } from '../events/eventBus';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createMessageBrokerHandler from './messageBroker';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers(): EventHandler<ApplicationEvent>[] {
  return [
    createEmailHandler(),
    createLoggingHandler(),
    createMessageBrokerHandler(),
    createProposalWorkflowHandler(),
  ];
}
