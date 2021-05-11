import path from 'path';
import {
  DialogSetting,
  PublishPlugin,
  IExtensionRegistration,
  AuthParameters,
  IBotProject,
  ProcessStatus,
  UserIdentity,
} from '@botframework-composer/types';

interface RegistrySettings {
  hostname: string;
  username: string;
  password: string;
}
interface PublishConfig {
  botId: string;
  version: string;
  registry: RegistrySettings;
  fullSettings: any;
}

export default async (composer: IExtensionRegistration): Promise<void> => {
  class DockerPublisher implements PublishPlugin<PublishConfig> {
    private composer: IExtensionRegistration;
    public name: string;
    public description: string;
    public bundleId: string;
    private readonly baseDir = path.resolve(__dirname, '../');

    constructor(name: string, description: string, bundleId: string) {
      this.name = name;
      this.description = description;
      this.bundleId = bundleId;
    }

    private buildDockerFile = async () => {};

    private triggerDockerBuild = async () => {};

    private pushToRegistry = async (registry: RegistrySettings) => {};

    publish = async (config: PublishConfig, project, metadata, user): Promise<any> => {
      const { registry, fullSettings } = config;
      this.composer.log('Starting publish');
    };

    private getBotsDir = () => process.env.LOCAL_PUBLISH_PATH || path.resolve(this.baseDir, 'hostedBots');

    private getBotDir = (botId: string) => path.resolve(this.getBotsDir(), botId);

    private getBotRuntimeDir = (botId: string) => path.resolve(this.getBotDir(botId), 'runtime');

    private getBotAssetsDir = (botId: string) => path.resolve(this.getBotDir(botId));
  }

  const publisher = new DockerPublisher('dockerPublish', 'Publish bot to Docker Images', 'dockerPublish');
  await composer.addPublishMethod(publisher);
};
