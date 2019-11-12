// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import settings from '../settings';
import { AssetManager } from '../models/asset/assetManager';

class AssetService {
  public manager: AssetManager;

  constructor() {
    this.manager = new AssetManager(settings.assetsLibray, settings.runtimeFolder);
  }
}

const service = new AssetService();
export default service;
