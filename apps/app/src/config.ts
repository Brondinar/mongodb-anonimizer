import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_COLLECTION = process.env.DB_COLLECTION;
const MIN_DOCS_COUNT_PER_INSERT = process.env.MIN_DOCS_COUNT_PER_INSERT ?? 1;
const MAX_DOCS_COUNT_PER_INSERT = process.env.MAX_DOCS_COUNT_PER_INSERT ?? 10;
const INSERT_INTERVAL_MS = process.env.INSERT_INTERVAL_MS ?? 200;

export const Config = {
  app: {
    minDocsCountPerInsert: +MIN_DOCS_COUNT_PER_INSERT,
    maxDocsCountsPerInsert: +MAX_DOCS_COUNT_PER_INSERT,
    insertIntervalMs: +INSERT_INTERVAL_MS,
  },
  mongo: {
    url: DB_URI,
    collection: DB_COLLECTION,
  },
};
