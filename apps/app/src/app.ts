import { CollectionSchema, getFakeDoc } from './lib/getFakeDoc.js';
import { getRandomInt } from './lib/random.js';
import { Config } from './config.js';
import { Collection } from 'mongodb';
import { MongoUtils } from 'shared';

export async function main() {
  const client = await MongoUtils.getClient(Config.mongo.url);

  try {
    const collection = client.db().collection<CollectionSchema>(Config.mongo.collection);

    await insertFakeDocs(collection);
  } catch (e) {
    console.error(e);
    await client.close();
  }
}

const insertFakeDocs = async (collection: Collection<CollectionSchema>) => {
  const docsCount = getRandomInt(Config.app.minDocsCountPerInsert, Config.app.maxDocsCountsPerInsert);
  const docs = [];

  for (let i = 0; i < docsCount; i++) {
    docs.push(getFakeDoc());
  }

  await collection.insertMany(docs);

  console.log('inserted', docs);

  setTimeout(() => insertFakeDocs(collection), Config.app.insertIntervalMs);
};

main().catch(console.error);
