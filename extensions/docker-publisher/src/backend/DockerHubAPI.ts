import { IRepository, RepositoryAPIProps } from '../types/interfaces';

export class DockerHubAPI implements IRepository {
  password: string;
  username: string;

  constructor(props?: RepositoryAPIProps) {
    this.username = props?.username;
    this.password = props?.password;
  }
  UpdateProps(props?: RepositoryAPIProps) {
    this.username = props?.username;
    this.password = props?.password;
  }

  public testEnvironment(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async getTags(imageName: string): Promise<string[]> {
    const response = await fetch(`/api/docker/dockerhub/${encodeURIComponent(imageName)}/tags`, {
      method: 'POST',
      body: JSON.stringify({ username: this.username, password: this.password }),
      headers: {
        'Content-type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  }
}
