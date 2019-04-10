import { FileInfo } from '../fileHandler';

import { DialogIndexer } from './dialogIndexer';
import { IIndexer } from './interface';
import { BotProjectIndexer } from './botProjectIndexer';

function createInstance<T>(indexer: new () => T): T {
  return new indexer();
}

const chain = [createInstance(DialogIndexer), createInstance(BotProjectIndexer)];

export function applyIndexer(entry: string, files: FileInfo[]) {
  const value = chain.reduce(
    (value: { [key: string]: any }, indexer: IIndexer): { [key: string]: any } => {
      return indexer.paser(entry, value.files, value.result);
    },
    { files, result: {} }
  );
  return value.result;
}
