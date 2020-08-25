// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';

async function getQnaContent(req: Request, res: Response) {
  try {
    const urls = decodeURIComponent(req.query.urls).split(',');
    res.status(200).json(await parseQnAContent(urls));
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
};
