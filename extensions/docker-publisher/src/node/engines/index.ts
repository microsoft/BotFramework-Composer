// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IEngine } from './IEngine';
import { LocalDocker } from './Local';
import { ACR } from './ACR';
import { DockerHub } from './DockerHub';
import { CustomRegistry } from './CustomRegistry';

export { IEngine };

export class DockerEngines {
  public static Factory(engine: string): IEngine {
    switch (engine) {
      case 'local':
        return new LocalDocker();

      case 'acr':
        return new ACR();

      case 'dockerhub':
        return new DockerHub();

      case 'custom':
        return new CustomRegistry();

      default:
        throw new Error('Invalid docker engine');
    }
  }
}
