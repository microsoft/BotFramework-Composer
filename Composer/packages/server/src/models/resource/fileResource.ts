import { Resource } from './resource';

export interface FileResource extends Resource {
  relativePath: string;
}
