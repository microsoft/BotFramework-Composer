import { ExecResult, RegistryConfigData } from '../../types';
import { DockerContext } from '../../types/dockerTypes';
import { execAsync } from '../../utils/fs';

export abstract class IEngine {
  public mountImageName(target: RegistryConfigData): string {
    if (target.creationType == 'local') {
      return `${target.image}:${target.tag}`;
    } else {
      return `${target.url}/${target.image}:${target.tag}`;
    }
  }

  public async buildImage(context: DockerContext): Promise<ExecResult> {
    const command = `docker build -t ${context.imageName} --no-cache --build-arg "EXECUTABLE=${context.botName}.dll" -f "${context.dockerfile}" "${context.botPath}"`;
    return await execAsync(command);
  }

  abstract verify(context: DockerContext): Promise<boolean>;
  abstract push(context: DockerContext): Promise<string>;
}
