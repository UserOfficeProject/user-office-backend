import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from './AdminDataSource';
import { CallDataSource } from './CallDataSource';
import { EventLogsDataSource } from './EventLogsDataSource';
import { FileDataSource } from './IFileDataSource';
import { InstrumentDataSource } from './InstrumentDataSource';
import { ProposalDataSource } from './ProposalDataSource';
import { ProposalSettingsDataSource } from './ProposalSettingsDataSource';
import { QuestionaryDataSource } from './QuestionaryDataSource';
import { ReviewDataSource } from './ReviewDataSource';
import { SampleDataSource } from './SampleDataSource';
import { SEPDataSource } from './SEPDataSource';
import { ShipmentDataSource } from './ShipmentDataSource';
import { SystemDataSource } from './SystemDataSource';
import { TemplateDataSource } from './TemplateDataSource';

export const userDataSource = container.resolve<ProposalDataSource>(
  Tokens.ProposalDataSource
);
export const proposalDataSource = container.resolve<ProposalDataSource>(
  Tokens.ProposalDataSource
);
export const reviewDataSource = container.resolve<ReviewDataSource>(
  Tokens.ReviewDataSource
);
export const callDataSource = container.resolve<CallDataSource>(
  Tokens.CallDataSource
);
export const fileDataSource = container.resolve<FileDataSource>(
  Tokens.FileDataSource
);
export const adminDataSource = container.resolve<AdminDataSource>(
  Tokens.AdminDataSource
);
export const templateDataSource = container.resolve<TemplateDataSource>(
  Tokens.TemplateDataSource
);
export const eventLogsDataSource = container.resolve<EventLogsDataSource>(
  Tokens.EventLogsDataSource
);
export const sepDataSource = container.resolve<SEPDataSource>(
  Tokens.SEPDataSource
);
export const instrumentDataSource = container.resolve<InstrumentDataSource>(
  Tokens.InstrumentDataSource
);
export const questionaryDataSource = container.resolve<QuestionaryDataSource>(
  Tokens.QuestionaryDataSource
);
export const sampleDataSource = container.resolve<SampleDataSource>(
  Tokens.SampleDataSource
);
export const proposalSettingsDataSource = container.resolve<ProposalSettingsDataSource>(
  Tokens.ProposalSettingsDataSource
);
export const shipmentDataSource = container.resolve<ShipmentDataSource>(
  Tokens.ShipmentDataSource
);
export const systemDataSource = container.resolve<SystemDataSource>(
  Tokens.SystemDataSource
);
