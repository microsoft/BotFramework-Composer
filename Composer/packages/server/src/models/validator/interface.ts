import { Resource, ResourceResolver } from '../resource/interface';

// Validator interface is also resource-based
export interface ResourceValidator {
  validate(resource: Resource, resolver: ResourceResolver): Diagnostic[];
}

export interface Diagnostic {
  name: string;
  // servity
  // position
  // message
}
