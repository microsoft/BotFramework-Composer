// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { execAsync } from '../../utils/fs';
import { DockerContext, Steps } from '../../types/dockerTypes';
import { ConfigSettings, ExecResult } from '../../types';

import { IEngine } from './IEngine';

export class LocalDocker extends IEngine {
  mountImageName(settings: ConfigSettings): string {
    return `${settings.image}:${settings.tag}`;
  }

  async push(context: DockerContext): Promise<ExecResult> {
    context.logger(Steps.PUSH_IMAGE, 'Not required for Local images', 200);
    return Promise.resolve({ stdout: 'Not required for Local images', stderr: undefined });
  }

  async verify(context: DockerContext): Promise<boolean> {
    const command = `docker images ${context.imageName} -q`;
    const { stdout, stderr } = await execAsync(command);

    return stderr == undefined;
  }
}
