// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';

import Worker from './workers/indexer.worker.ts';
import { BaseWorker } from './baseWorker';
import { IndexPayload } from './types';

// Wrapper class
class Indexer extends BaseWorker {
  index(files: FileInfo, botName: string, schemas: any, locale: string) {
    return this.sendMsg<IndexPayload>({ files, botName, schemas, locale });
  }
}

export default new Indexer(new Worker());
