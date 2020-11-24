// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { TelemetryService } from '../services/telemetry';

async function track(req: Request, res: Response) {
  try {
    const { type, name, properties, url } = req.body;
    TelemetryService.track(type, name, properties, url);
    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

export const TelemetryController = {
  track,
};
