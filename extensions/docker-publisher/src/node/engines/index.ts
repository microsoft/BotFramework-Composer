import { IEngine } from './IEngine';
import { LocalDocker } from './Local';
import { ACR } from './ACR';

export { IEngine };

export class DockerEngines {
  public static Factory(engine: string): IEngine {
    switch (engine) {
      case 'local':
        return new LocalDocker();

      case 'acr':
        return new ACR();

      case 'dockerhub':
        throw 'not implented';

      case 'custom':
        throw 'not implented';

      default:
        throw new Error('Invalid docker engine');
    }
  }
}
