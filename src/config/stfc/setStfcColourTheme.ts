import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

export default function setStfcColourTheme() {
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
}
