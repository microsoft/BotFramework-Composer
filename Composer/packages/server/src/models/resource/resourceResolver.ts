import { Resource } from './resource';

// A resource can refer to another resource, ResourceResolver is used to resolve a reference
// given a start point and a reference string, resolver will resolve another resource
// this will a very common-used interface
export interface ResourceResolver {
  resolve(srcResource: Resource, reference: string): Resource;
}
