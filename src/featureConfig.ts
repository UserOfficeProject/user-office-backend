import * as config from '../featureConfig.json';
import database from './datasources/postgres/database';

function setFeatures() {
  console.log('Setting features');
  config.features.forEach(
    async (feature: { feature_id: string; enabled: boolean }) => {
      await database
        .update({
          is_enabled: feature.enabled,
        })
        .from('features')
        .where('feature_id', feature.feature_id);
    }
  );
}

setFeatures();
