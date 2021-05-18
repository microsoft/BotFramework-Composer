// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfigSettings, ExecResult } from '../../types';
import { DockerContext, Steps } from '../../types/dockerTypes';
import { execAsync } from '../../utils/fs';

import { IEngine } from './IEngine';

type Authentication = {
  username: string;
  password: string;
};

export class DockerHub extends IEngine {
  async verify(context: DockerContext): Promise<boolean> {
    const [username, name, tag] = context.imageName.split(/\/|:/);
    const { token, success } = await this.GetDockerHubToken({ username: context.username, password: context.password });

    if (!success) {
      context.logger(Steps.VERIFY_IMAGE, token, 500);
      return false;
    }

    const tagUrl = `https://hub.docker.com/v2/repositories/${username}/${name}/tags`;
    const response = await fetch(tagUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json',
      },
    });

    if (response.status == 200) {
      const { results } = await response.json();
      const tags = results.map((o) => o.name);

      context.logger(Steps.PUSH_IMAGE, `Found ${tags.length} tags: ${JSON.stringify(tags)}`, response.status);

      return tags.find((t) => t === tag) !== undefined;
    } else {
      context.logger(Steps.PUSH_IMAGE, await response.text(), response.status);
      return false;
    }
  }

  private async GetDockerHubToken(authentication: Authentication): Promise<{ token: string; success: boolean }> {
    const response = await fetch('https://hub.docker.com/v2/users/login/', {
      method: 'POST',
      body: JSON.stringify(authentication),
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        token: await response.text(),
      };
    }

    const { token } = await response.json();

    return { token: token, success: true };
  }

  mountImageName(settings: ConfigSettings): string {
    return `${settings.username}/${settings.image}:${settings.tag}`;
  }

  async push(context: DockerContext): Promise<ExecResult> {
    if (!(await this.Login(context))) {
      return { stdout: undefined, stderr: 'Failed login' };
    }

    const command = `docker push ${context.imageName}`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      context.logger(Steps.PUSH_IMAGE, stderr, 500);
    }

    return { stdout, stderr };
  }

  private async Login(context: DockerContext): Promise<boolean> {
    context.logger(Steps.PUSH_IMAGE, 'Logging in to Docker Hub');
    const command = `docker login --username ${context.username} --password ${context.password}`;
    const { stdout, stderr } = await execAsync(command);

    if (!stderr) {
      context.logger(Steps.PUSH_IMAGE, stdout, 200);
    }

    return stderr == undefined;
  }
}
