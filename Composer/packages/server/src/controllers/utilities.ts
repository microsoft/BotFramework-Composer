// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';

async function getQnaContent(req: Request, res: Response) {
  try {
    res.status(200).json(await parseQnAContent(req.query.url.trim()));
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
};
