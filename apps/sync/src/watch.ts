import { Collection, MongoClient, ResumeToken } from 'mongodb';
import { anonymizeDocument } from './lib/anonymizeValue.js';
import { CollectionWatcher } from './lib/mongo/collectionWatcher.js';
import type { Config } from './types';
import { MongoUtils } from 'shared';

export const runWatcher = async ({
  targetClient,
  metaCollection,
  collectionOrigin,
  collectionTarget,
  resumeToken,
  config,
}: {
  targetClient: MongoClient;
  metaCollection: Collection;
  collectionOrigin: Collection;
  collectionTarget: Collection;
  resumeToken?: ResumeToken;
  config: Config;
}) => {
  const watcher = new CollectionWatcher(collectionOrigin, config.maxDocsPerUpdate);

  watcher.on('change', changes => {
    if (changes.length === 0) return;

    const bulkOperations = [];

    for (const change of changes) {
      switch (change.operationType) {
        case 'insert':
          bulkOperations.push({
            replaceOne: {
              filter: { _id: change.fullDocument._id },
              replacement: anonymizeDocument(change.fullDocument, config.anonymizeFields),
              upsert: true,
            },
          });
          break;
        case 'update':
          // todo: смотреть только изменяемые поля, а не заменять весь документ
          bulkOperations.push({
            replaceOne: {
              filter: { _id: change.fullDocument._id },
              replacement: anonymizeDocument(change.fullDocument, config.anonymizeFields),
            },
          });
      }
    }

    MongoUtils.runInTransaction(targetClient, async options => {
      await collectionTarget.bulkWrite(bulkOperations, options);
      await metaCollection.updateOne({}, { $set: { resumeToken: changes.at(-1)._id } }, { ...options, upsert: true });
    });
  });

  await watcher.run(resumeToken);
};
