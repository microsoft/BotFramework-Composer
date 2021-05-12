import { IRepository, RepositoryAPIProps } from '../types/interfaces';

export class ACRAPI implements IRepository {
  url: string;
  token: string;

  constructor(props?: RepositoryAPIProps) {
    this.url = props.url;
    this.token = btoa(`${props.username}:${props.password}`);
  }

  public UpdateProps(props?: RepositoryAPIProps) {
    this.url = props.url;
    this.token = btoa(`${props.username}:${props.password}`);
  }

  public testEnvironment(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async getTags(imageName: string): Promise<string[]> {
    let url = encodeURIComponent(`https://${this.url}/acr/v1/${imageName.trim()}/_tags`);
    let options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    };

    const response = await fetch(`/api/docker/acr/${url}/tags`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (response.status == 200) {
      let result = await response.json();
      return result;
    }

    return [];
  }
}
