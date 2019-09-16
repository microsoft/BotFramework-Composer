// The basic interface for declartive resource
// we need to model things as resource so that we can have a unified interface
// for loading\validating\refering those declative assets, we will have a good
// alignment between runtime and composer

// maybe call this DeclativeResource ?
export interface Resource {
  id: string;
  content: string;
  type: ResourceType;
}

export enum ResourceType {
  DIALOG = 'dialog',
  LG = 'lg',
  LU = 'lu',
  JSON = 'json',
}
