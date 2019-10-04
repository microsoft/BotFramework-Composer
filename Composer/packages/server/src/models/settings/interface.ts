export interface ISettingManager {
  get(slot: string, obfuscate: boolean): Promise<any | null>;
  set(slot: string, settings: any): Promise<void>;
}
