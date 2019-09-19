import { Diagnostic } from '../validator';

// The basic interface for declartive resource
// we need to model things as resource so that we can have a unified interface
// for loading\validating\refering those declative assets, we will have a good
// alignment between runtime and composer

// maybe call this DeclativeResource ?
export interface Resource {
  id: string;
  content: string;
  type: ResourceType;
  diagnostics?: Diagnostic[];

  // index is the process of extracting userful information from raw content
  index(): Promise<void>;
}

export enum ResourceType {
  DIALOG = 'dialog',
  LG = 'lg',
  LU = 'lu',
  JSON = 'json',
  SCHEMA = 'schema',
}
