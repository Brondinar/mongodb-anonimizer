import type { Config } from './types';
import { runFullReindex } from './fullReindex.js';
import { runWatcher } from './watch.js';
import { MongoUtils } from 'shared';

const checkAndUpdateConfig = (config: Config): Config => {
  // TODO: добавить полную валидацию полей
  if (
    !config?.mongo?.origin?.url ||
    !config.mongo.origin.collection ||
    !config.mongo.target?.url ||
    !config.mongo.target.collection ||
    !config.anonymizeFields
  ) {
    throw new Error(`Config is invalid`);
  }

  return { fullSync: false, metaCollection: '__mongodb-anonymizer-meta', maxDocsPerUpdate: 1000, ...config };
};

export const runSync = async (userConfig: Config) => {
  const config = checkAndUpdateConfig(userConfig);

  const originClient = await MongoUtils.getClient(config.mongo.origin.url);
  const targetClient = await MongoUtils.getClient(config.mongo.target.url);

  try {
    const dbOrigin = await originClient.db();
    const dbTarget = await targetClient.db();
    const collectionOrigin = dbOrigin.collection(config.mongo.origin.collection);
    const collectionTarget = dbTarget.collection(config.mongo.target.collection);

    if (config.fullSync) {
      await runFullReindex(collectionOrigin, collectionTarget, config);
    } else {
      const metaCollection = await dbTarget.collection(userConfig.metaCollection);
      const meta = await metaCollection.findOne();

      await runWatcher({
        targetClient,
        metaCollection,
        collectionOrigin,
        collectionTarget,
        resumeToken: meta?.resumeToken,
        config,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    await originClient.close();
    await targetClient.close();
  }
};
