import 'reflect-metadata';

import { PostgresAdminDataSourceWithAutoUpgrade } from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresInstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import StfcProposalDataSource from '../datasources/stfc/StfcProposalDataSource';
import PostgresProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import PostgresQuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import PostgresRiskAssessmentDataSource from '../datasources/postgres/RiskAssessmentDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresSEPDataSource from '../datasources/postgres/SEPDataSource';
import PostgresShipmentDataSource from '../datasources/postgres/ShipmentDataSource';
import PostgreSystemDataSource from '../datasources/postgres/SystemDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import { StfcUserDataSource } from '../datasources/stfc/StfcUserDataSource';
import { SMTPMailService } from '../eventHandlers/MailService/SMTPMailService';
import { createSkipPostingHandler } from '../eventHandlers/messageBroker';
import { SkipAssetRegistrar } from '../utils/EAM_service';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { RiskAssessmentAuthorization } from '../utils/RiskAssessmentAuthorization';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';
import { VisitAuthorization } from '../utils/VisitAuthorization';
import { configureSTFCEnvironment } from './stfc/configureSTFCEnvironment';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.UserAuthorization, UserAuthorization);
mapClass(Tokens.QuestionaryAuthorization, QuestionaryAuthorization);
mapClass(Tokens.RiskAssessmentAuthorization, RiskAssessmentAuthorization);
mapClass(Tokens.SampleAuthorization, SampleAuthorization);
mapClass(Tokens.ShipmentAuthorization, ShipmentAuthorization);
mapClass(Tokens.VisitAuthorization, VisitAuthorization);

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.InstrumentDataSource, PostgresInstrumentDataSource);
mapClass(Tokens.ProposalDataSource, StfcProposalDataSource);
mapClass(Tokens.ProposalSettingsDataSource, PostgresProposalSettingsDataSource);
mapClass(Tokens.QuestionaryDataSource, PostgresQuestionaryDataSource);
mapClass(Tokens.ReviewDataSource, PostgresReviewDataSource);
mapClass(Tokens.RiskAssessmentDataSource, PostgresRiskAssessmentDataSource);
mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
mapClass(Tokens.SEPDataSource, PostgresSEPDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgreSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UserDataSource, StfcUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SMTPMailService);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());

mapValue(Tokens.ConfigureEnvironment, configureSTFCEnvironment);
