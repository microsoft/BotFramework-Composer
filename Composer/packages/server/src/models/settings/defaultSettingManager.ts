import { FileSettingManager } from './fileSettingManager';

export class DefaultSettingManager extends FileSettingManager {
  constructor(basePath: string) {
    super(basePath);
  }

  protected createDefaultSettings = (): any => {
    return {
      MicrosoftAppPassword: '',
      MicrosoftAppId: '',
      luis: {
        name: '',
        authoringKey: '',
        endpointKey: '',
        authoringRegion: 'westus',
        defaultLanguage: 'en-us',
        environment: 'composer',
      },
    };
  };
}
