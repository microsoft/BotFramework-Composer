// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ConfigSettings, ExecResult } from '../../types';
import { DockerContext, Steps } from '../../types/dockerTypes';
import { execAsync } from '../../utils/fs';

import { IEngine } from './IEngine';

export class ACR extends IEngine {
  async verify(context: DockerContext): Promise<boolean> {
    const [registry, name, tag] = context.imageName.split(/\/|:/);
    const token = Buffer.from(`${context.username}:${context.password}`).toString('base64');
    const url = `https://${registry}/acr/v1/${name}/_tags`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Basic ${token}`,
      },
    });

    if (response.status == 200) {
      const { tags } = await response.json();

      context.logger(Steps.PUSH_IMAGE, `Found ${tags.length} tags: ${JSON.stringify(tags)}`, response.status);

      return tags.find((t) => t.name === tag) !== undefined;
    } else {
      context.logger(Steps.PUSH_IMAGE, await response.text(), response.status);
      return false;
    }
  }

  mountImageName(settings: ConfigSettings): string {
    return `${settings.url}/${settings.image}:${settings.tag}`;
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
    context.logger(Steps.PUSH_IMAGE, 'Logging in to ACR');
    const command = `docker login --username ${context.username} --password ${context.password} ${context.registry}`;
    const { stdout, stderr } = await execAsync(command);

    if (!stderr) {
      context.logger(Steps.PUSH_IMAGE, stdout, 200);
    }

    return stderr == undefined;
  }
}
