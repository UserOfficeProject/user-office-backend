import 'reflect-metadata';
import { container } from 'tsyringe';

import AdminDataSource, {
  PostgresAdminDataSourceWithAutoUpgrade,
} from '../datasources/postgres/AdminDataSource';
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
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import { StfcUserDataSource } from '../datasources/stfc/StfcUserDataSource';
import { SMTPMailService } from '../eventHandlers/MailService/SMTPMailService';
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

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
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
mapClass(Tokens.UserDataSource, StfcUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SMTPMailService);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());

mapValue(Tokens.EnableDefaultFeatures, () => {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.setFeatures([FeatureId.EXTERNAL_AUTH], true);
});

mapValue(Tokens.SetColourTheme, () => {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#303f9f');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#3f51b5');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#7986cb');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#c51162');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#f50057');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#ff4081');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#f44336');
  dataSource.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#4caf50');
  dataSource.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#ff9800');
  dataSource.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#2196f3');
  dataSource.updateSettings(
    SettingsId.HEADER_LOGO_FILENAME,
    'stfc-ukri-white.svg'
  );
});
