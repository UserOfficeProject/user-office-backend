import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventHandler } from '../events/eventBus';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers(): EventHandler<ApplicationEvent>[] {
  return [
    createEmailHandler(),
    createLoggingHandler(),
    container.resolve(Tokens.PostToMessageQueue),
    createProposalWorkflowHandler(),
  ];
}
