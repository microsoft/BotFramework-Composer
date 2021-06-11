// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfigSettings, ExecResult } from '../../types';
import { DockerContext } from '../../types/dockerTypes';
import { execAsync } from '../../utils/fs';

export abstract class IEngine {
  public async buildImage(context: DockerContext): Promise<ExecResult> {
    const command = `docker build --rm -t ${context.imageName} --no-cache --build-arg "EXECUTABLE=${context.botName}.dll" -f "${context.dockerfile}" "${context.botPath}"`;
    return await execAsync(command);
  }

  abstract mountImageName(settings: ConfigSettings): string;
  abstract verify(context: DockerContext): Promise<boolean>;
  abstract push(context: DockerContext): Promise<ExecResult>;
}
