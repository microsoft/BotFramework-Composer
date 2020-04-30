// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import Worker from 'worker-loader!./workers/indexer.worker.ts';

import { BaseParser } from './baseParser';

export type IndexPayload = {
  files: FileInfo;
  botName: string;
  schemas: any;
  locale: string;
};

// Wrapper class
class Indexer extends BaseParser {
  index(files: FileInfo, botName: string, schemas: any, locale: string) {
    return this.sendMsg<IndexPayload>({ files, botName, schemas, locale });
  }
}

export default new Indexer(new Worker());
