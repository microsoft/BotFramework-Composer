import { FileInfo } from './../fileHandler';

export interface IIndexer {
  readonly type: string;
  readonly extName: string;
  check(extName: string): boolean;
  paser(entry: string, files: FileInfo[], result: { [key: string]: any }): any;
}
