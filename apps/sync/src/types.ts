import { AnonymizedFieldsConfig } from './lib/anonymizeValue';

export type Config = {
  anonymizeFields: AnonymizedFieldsConfig;
  fullSync?: boolean;
  metaCollection?: string;
  maxDocsPerUpdate?: number;
  mongo: {
    origin: {
      url: string;
      collection: string;
    };
    target: {
      url: string;
      collection: string;
    };
  };
};
