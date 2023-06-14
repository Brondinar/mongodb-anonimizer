import crypto from 'crypto';
import type { Document } from 'mongodb';

type FieldTypes = 'full' | 'email';
export type AnonymizedFieldsConfig = { [key in string]: FieldTypes | AnonymizedFieldsConfig };

export const anonymizeValue = (value: string) => {
  // TODO: сразу переводить в base62
  return crypto.createHash('md5').update(value).digest('base64').replace(/\+|\//, '').slice(0, 8);
};

export const anonymizeDocument = (doc: Document, anonymizeFields: AnonymizedFieldsConfig) => {
  const anonymizeObject = (obj: Record<string, any>, rules: AnonymizedFieldsConfig) => {
    Object.entries(rules).forEach(([fieldName, fieldType]) => {
      let anonymizedValue;

      if (typeof fieldType === 'object' && fieldType !== null) {
        anonymizedValue = anonymizeObject(obj[fieldName], fieldType);
      } else if (fieldType === 'full') {
        anonymizedValue = anonymizeValue(obj[fieldName]);
      } else if (fieldType === 'email') {
        const emailSplitted = obj[fieldName].split('@');

        anonymizedValue =
          emailSplitted.length === 2 ? `${anonymizeValue(emailSplitted[0])}@${emailSplitted[1]}` : obj[fieldName];
      } else {
        throw new Error(`Unknown property: ${fieldType}`);
      }

      obj[fieldName] = anonymizedValue;
    });

    return obj;
  };

  return anonymizeObject(doc, anonymizeFields);
};
