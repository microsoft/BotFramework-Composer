// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';

async function getQnaContent(req: Request, res: Response) {
  const urls = req.query.urls;
  try {
    if (Array.isArray(urls)) {
      res.status(200).json(await parseQnAContent(urls));
    } else {
      res.status(400).json({
        message: 'Bad Argument',
      });
    }
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
};
