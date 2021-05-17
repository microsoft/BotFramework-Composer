// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RepositoryAPIProps } from '../types';
import { IRepository } from '../types/interfaces';

export class ACRAPI implements IRepository {
  url: string;
  token: string;

  constructor(props?: RepositoryAPIProps) {
    this.url = props.url;
    this.token = Buffer.from(`${props.username}:${props.password}`).toString('base64');
  }

  public UpdateProps(props?: RepositoryAPIProps) {
    this.url = props.url;
    this.token = Buffer.from(`${props.username}:${props.password}`).toString('base64');
  }

  public testEnvironment(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async getTags(imageName: string): Promise<string[]> {
    const url = encodeURIComponent(`https://${this.url}/acr/v1/${imageName.trim()}/_tags`);
    const options: RequestInit = {
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
      const result = await response.json();
      return result;
    }

    return [];
  }
}
