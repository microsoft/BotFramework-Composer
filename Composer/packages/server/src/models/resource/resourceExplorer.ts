import { Resource } from './resource';
import { ResourceResolver } from './resourceResolver';

export interface ResourceExplorer extends ResourceResolver {
  getResource(id: string): Promise<Resource>;
  getResources(): Promise<Resource[]>;
  addResource(resource: Resource): Promise<void>;
  deleteResource(id: string): Promise<void>;
  updateResource(id: string, newResource: Resource): Promise<void>;
}
