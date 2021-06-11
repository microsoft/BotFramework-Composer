// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { execAsync } from '../../utils/fs';
import { DockerContext, Steps } from '../../types/dockerTypes';
import { ConfigSettings, ExecResult } from '../../types';

import { IEngine } from './IEngine';

export class CustomRegistry extends IEngine {
  mountImageName(settings: ConfigSettings): string {
    return `${settings.url}/${settings.image}:${settings.tag}`;
  }

  async push(context: DockerContext): Promise<ExecResult> {
    const command = `docker push ${context.imageName}`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      context.logger(Steps.PUSH_IMAGE, stderr, 500);
    }

    return { stdout, stderr };
  }

  async verify(context: DockerContext): Promise<boolean> {
    const command = `docker images ${context.imageName} -q`;
    const { stdout, stderr } = await execAsync(command);

    return stderr == undefined;
  }
}
