import { ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';

export type CollectionSchema = {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    line1: string;
    line2: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
  };
  createdAt: Date;
};

export const getFakeDoc = (): CollectionSchema => {
  return {
    _id: new ObjectId(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    address: {
      line1: faker.location.streetAddress(),
      line2: faker.location.streetAddress(),
      postcode: faker.location.zipCode(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
    },
    createdAt: faker.date.recent(),
  };
};
