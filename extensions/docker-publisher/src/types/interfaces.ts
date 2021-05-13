import { RepositoryAPIProps } from '.';

export interface DockerAPIError {
  Error: string;
}

export interface IRepository {
  UpdateProps(props?: RepositoryAPIProps);
  testEnvironment(): Promise<boolean>;
  getTags(imageName: string): Promise<string[] | DockerAPIError>;
}
