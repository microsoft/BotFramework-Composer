// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';

async function getQnaContent(req: Request, res: Response) {
  if (!Array.isArray(req.query.urls)) {
    res.status(400).json({
      message: 'Invalid parameters',
    });
  }
  try {
    res.status(200).json(await parseQnAContent(req.query.urls));
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
};
