// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AssetManager } from '../models/asset/assetManager';

class AssetService {
  public manager: AssetManager;

  constructor() {
    this.manager = new AssetManager();
  }
}

const service = new AssetService();
export default service;
