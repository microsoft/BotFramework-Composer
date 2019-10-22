import { FileSettingManager } from './fileSettingManager';

export class HostedSettingManager extends FileSettingManager {
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

  protected validateSlot = (slot: string): void => {
    if (slot !== 'integration' && slot !== 'production') {
      throw new Error(`Unknown slot name: ${slot}.`);
    }
  };
}
