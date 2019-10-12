import { FileSettingManager } from './fileSettingManager';

export class HostedSettingManager extends FileSettingManager {
  constructor(basePath: string) {
    super(basePath);
  }

  protected createDefaultSettings = (): any => {
    return {};
  };

  protected validateSlot = (slot: string): void => {
    if (slot !== 'integration' && slot !== 'production') {
      throw new Error(`Unknown slot name: ${slot}.`);
    }
  };
}
