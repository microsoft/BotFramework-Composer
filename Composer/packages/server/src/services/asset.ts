import settings from '../settings/settings';
import { AssetManager } from '../models/asset/assetManager';

class AssetService {
  public manager: AssetManager;

  constructor() {
    this.manager = new AssetManager(settings.assetsLibray, settings.runtimeFolder);
  }
}

const service = new AssetService();
export default service;
