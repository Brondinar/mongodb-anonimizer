#!/usr/bin/env node

import { runSync } from '../dist/index.js';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_COLLECTION_ORIGIN = process.env.DB_COLLECTION_ORIGIN;
const DB_COLLECTION_COPY = process.env.DB_COLLECTION_COPY;
const ANONYMIZE_FIELDS = process.env.ANONYMIZE_FIELDS ?? '{}';
const META_COLLECTION_NAME = process.env.META_COLLECTION_NAME;
const MAX_DOCS_PER_UPDATE = +process.env.MAX_DOCS_PER_UPDATE || 1000;

const fullSync = process.argv.includes('--full-reindex');

const config = {
  anonymizeFields: JSON.parse(ANONYMIZE_FIELDS),
  fullSync,
  metaCollection: META_COLLECTION_NAME,
  maxDocsPerUpdate: MAX_DOCS_PER_UPDATE,
  mongo: {
    origin: {
      url: DB_URI,
      collection: DB_COLLECTION_ORIGIN,
    },
    target: {
      url: DB_URI,
      collection: DB_COLLECTION_COPY,
    },
  },
};

console.log(config);

runSync(config);
