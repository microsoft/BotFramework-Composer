// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { FeatureFlagService } from '../services/featureFlags';

async function getFeatureFlags(req: Request, res: Response) {
  try {
    const featureFlags = await FeatureFlagService.getFeatureFlags();
    return res.status(200).json(featureFlags);
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

async function updateFeatureFlags(req: Request, res: Response) {
  try {
    if (!req.body.featureFlags) {
      res.status(400).json({
        message: 'parameters not provided, require feature flags',
      });
      return;
    }
    const featureFlags = req.body.featureFlags;
    await FeatureFlagService.updateFeatureFlag(featureFlags);
    res.status(200).json(featureFlags);
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

export const FeatureFlagController = {
  getFeatureFlags,
  updateFeatureFlags,
};
