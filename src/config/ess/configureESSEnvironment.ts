import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

async function setEssColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#519548');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#519548');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#BEF202');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_ACCENT, '#000000');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#1B676B');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#1B676B');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#1B676B');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#ffffff');
  await db.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#f44336');
  await db.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#4caf50');
  await db.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#ff9800');
  await db.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#2196f3');
  await db.updateSettings(SettingsId.HEADER_LOGO_FILENAME, 'ess-white.svg');
}

async function enableDefaultEssFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.setFeatures(
    [
      FeatureId.SCHEDULER,
      FeatureId.SHIPPING,
      FeatureId.RISK_ASSESSMENT,
      FeatureId.EMAIL_INVITE,
    ],
    true
  );

  if (process.env.TZ) {
    await db.updateSettings(SettingsId.TIMEZONE, process.env.TZ);
  } else {
    const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    logger.logInfo(
      `Timezone should be explicitly set via 'TZ' environment variable, defaulting to '${defaultTimezone}'`,
      {}
    );
    await db.updateSettings(SettingsId.TIMEZONE, defaultTimezone);
  }
}

export async function configureESSDevelopmentEnvironment() {
  await setEssColourTheme();
  await enableDefaultEssFeatures();
}
