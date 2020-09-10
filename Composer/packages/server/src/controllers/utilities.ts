// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';

async function getQnaContent(req: Request, res: Response) {
  try {
    const urls = decodeURIComponent(req.query.urls).split(',');
    const multiTurn = req.query.multiTurn === 'true' || req.query.multiTurn === true ? true : false;
    res.status(200).json(await parseQnAContent(urls, multiTurn));
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
};
