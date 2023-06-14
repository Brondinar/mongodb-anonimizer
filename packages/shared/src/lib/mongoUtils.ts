import { ClientSession, MongoClient } from 'mongodb';

export class MongoUtils {
  static async getClient(url: string) {
    const client = new MongoClient(url);

    return client.connect();
  }

  static async runInTransaction(
    client: MongoClient,
    func: (obj: object & { session: ClientSession }) => Promise<void>,
    extraOptions?: object
  ) {
    const session = await client.startSession();

    try {
      await session.startTransaction();

      const options = { session, ...extraOptions };

      await func(options);

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  }
}
