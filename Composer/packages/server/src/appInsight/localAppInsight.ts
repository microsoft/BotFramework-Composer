import { StorageConnection, IFileStorage } from 'src/models/storage/interface';

import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';

import { IAppInsight } from './appInsightClient';

class LocalAppInsight implements IAppInsight {
  private STORE_KEY = 'errorCollectionStorage';
  private collectLocation: StorageConnection;
  private errorStorage: IFileStorage;
  constructor() {
    this.collectLocation = Store.get(this.STORE_KEY);
    this.errorStorage = StorageFactory.createStorageClient(this.collectLocation);
  }
  trackException(exception: Error) {
    if (this.errorStorage) {
      this.errorStorage.writeFile(this.collectLocation.path, exception);
    }
  }
}

export const localAppInsight = new LocalAppInsight();
