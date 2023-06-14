import { ChangeStreamDocument, Collection, ResumeToken } from 'mongodb';
import EventEmitter from 'eventemitter3';

// TODO: добавить остальные типы
const SUPPORTED_OPERATION_TYPES = ['insert', 'update'];

type EventTypes = {
  change: (changes: ChangeStreamDocument[]) => void;
};

export class CollectionWatcher extends EventEmitter<EventTypes> {
  private changes: ChangeStreamDocument[] = [];
  private intervalId?: NodeJS.Timer;

  constructor(
    private readonly collection: Collection,
    private readonly maxDocsPerUpdate: number,
    private readonly observeInterval = 1000
  ) {
    super();
  }

  async run(resumeToken?: ResumeToken) {
    const changeStream = this.collection.watch([], { fullDocument: 'updateLookup', startAfter: resumeToken });

    this.runEventsInterval();

    for await (const change of changeStream) {
      console.log('Received change:\n', change);
      console.log('Resume token', change._id);

      if (SUPPORTED_OPERATION_TYPES.includes(change.operationType)) {
        this.addChange(change);
      }
    }

    await changeStream.close();

    clearInterval(this.intervalId);
  }

  private runEventsInterval() {
    this.intervalId = setInterval(() => this.emitChanges(), this.observeInterval);
  }

  private addChange(change: ChangeStreamDocument) {
    this.changes.push(change);

    if (this.changes.length >= this.maxDocsPerUpdate) {
      this.emitChanges();
    }
  }

  private emitChanges() {
    if (this.changes.length === 0) return;

    const changes = this.changes;
    this.changes = [];

    this.emit('change', changes);
  }
}
