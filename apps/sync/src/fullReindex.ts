import { Collection } from 'mongodb';
import type { Config } from './types';
import { anonymizeDocument } from './lib/anonymizeValue.js';

export const runFullReindex = async (collectionOrigin: Collection, collectionTarget: Collection, config: Config) => {
  let i = 0;
  let finished = false;

  while (!finished) {
    const bulkOps = [];
    const docsCursor = collectionOrigin.find({}, { skip: i, limit: config.maxDocsPerUpdate });

    for await (const document of docsCursor) {
      bulkOps.push({
        replaceOne: {
          filter: { _id: document._id },
          replacement: anonymizeDocument(document, config.anonymizeFields),
          upsert: true,
        },
      });
    }

    console.dir(bulkOps);

    if (bulkOps.length > 0) {
      await collectionTarget.bulkWrite(bulkOps);
      i += config.maxDocsPerUpdate;
    } else {
      finished = true;
    }
  }
};
