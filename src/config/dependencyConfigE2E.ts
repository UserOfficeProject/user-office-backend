import 'reflect-metadata';
import { container } from 'tsyringe';

import { AdminDataSource } from '../datasources/AdminDataSource';
import PostgresAdminDataSource from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresInstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import PostgresProposalDataSource from '../datasources/postgres/ProposalDataSource';
import PostgresProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import PostgresQuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresSEPDataSource from '../datasources/postgres/SEPDataSource';
import PostgresShipmentDataSource from '../datasources/postgres/ShipmentDataSource';
import PostgreSystemDataSource from '../datasources/postgres/SystemDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresUserDataSource from '../datasources/postgres/UserDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import { SkipSendMailService } from '../eventHandlers/MailService/SkipSendMailService';
import { createSkipPostingHandler } from '../eventHandlers/messageBroker';
import { FeatureId } from '../models/Feature';
import { SettingsId } from '../models/Settings';
import { SkipAssetRegistrar } from '../utils/EAM_service';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';
import { VisitAuthorization } from '../utils/VisitAuthorization';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.UserAuthorization, UserAuthorization);
mapClass(Tokens.QuestionaryAuthorization, QuestionaryAuthorization);
mapClass(Tokens.SampleAuthorization, SampleAuthorization);
mapClass(Tokens.ShipmentAuthorization, ShipmentAuthorization);
mapClass(Tokens.VisitAuthorization, VisitAuthorization);

mapClass(Tokens.AdminDataSource, PostgresAdminDataSource);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.InstrumentDataSource, PostgresInstrumentDataSource);
mapClass(Tokens.ProposalDataSource, PostgresProposalDataSource);
mapClass(Tokens.ProposalSettingsDataSource, PostgresProposalSettingsDataSource);
mapClass(Tokens.QuestionaryDataSource, PostgresQuestionaryDataSource);
mapClass(Tokens.ReviewDataSource, PostgresReviewDataSource);
mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
mapClass(Tokens.SEPDataSource, PostgresSEPDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgreSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UserDataSource, PostgresUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SkipSendMailService);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());

mapValue(Tokens.EnableDefaultFeatures, () => {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.setFeatures([FeatureId.SCHEDULER, FeatureId.SHIPPING], true);
});
mapValue(Tokens.SetColourTheme, () => {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#b33739');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#FF4E50');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#FC913A');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#F9D423');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#F9D423');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#E1F5C4');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#f44336');
  dataSource.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#4caf50');
  dataSource.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#ff9800');
  dataSource.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#2196f3');
  dataSource.updateSettings(SettingsId.HEADER_LOGO_FILENAME, 'ess-white.svg');
});
