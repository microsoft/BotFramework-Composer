import settings from '../settings/settings.json';

import { AssetsManager } from './../models/asset/assetsManager';

class AssetService {
  public manager: AssetsManager;

  constructor() {
    this.manager = new AssetsManager(settings.assetsLibray);
  }
}

const service = new AssetService();
export default service;
