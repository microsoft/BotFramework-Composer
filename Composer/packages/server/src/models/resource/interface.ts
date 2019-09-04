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

// A resource can refer to another resource, ResourceResolver is used to resolve a reference
// given a start point and a reference string, resolver will resolve another resource
// this will a very common-used interface
export interface ResourceResolver {
  Resolve(srcResource: Resource, reference: string): Resource;
}
