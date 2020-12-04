// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import SettingsService from '../services/settings';

async function getUserSettings(req: Request, res: Response) {
  try {
    const settings = SettingsService.getSettings();
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

async function updateUserSettings(req: Request, res: Response) {
  try {
    const { settings } = req.body;
    const updatedSettings = SettingsService.setSettings(settings);
    return res.status(200).json(updatedSettings);
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

export const SettingsController = {
  getUserSettings,
  updateUserSettings,
};
