// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RepositoryAPIProps } from '../types';
import { IRepository } from '../types/interfaces';

export class DockerEngine implements IRepository {
  constructor();
  constructor(props?: RepositoryAPIProps) {}
  UpdateProps(props?: RepositoryAPIProps) {}

  public async testEnvironment(): Promise<boolean> {
    const response = await fetch('/api/docker/version', {
      method: 'GET',
    });

    const result = await response.json();

    return result.userHasDocker;
  }

  public async getTags(imageName: string): Promise<string[]> {
    const response = await fetch(`/api/docker/local/${encodeURIComponent(imageName)}/tags`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  }
}
