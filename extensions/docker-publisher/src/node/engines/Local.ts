// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { execAsync } from '../../utils/fs';
import { DockerContext, Steps } from '../../types/dockerTypes';

import { IEngine } from './IEngine';

export class LocalDocker extends IEngine {
  async push(context: DockerContext): Promise<string> {
    context.logger(Steps.PUSH_IMAGE, 'Not required for Local images', 200);
    return Promise.resolve('');
  }

  async verify(context: DockerContext): Promise<boolean> {
    const command = `docker images ${context.imageName} -q`;
    const { stdout, stderr } = await execAsync(command);

    return stderr == undefined;
  }
}
