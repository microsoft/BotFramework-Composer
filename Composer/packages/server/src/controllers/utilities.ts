// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { exec } from 'child_process';
import { promisify } from 'util';

import { Request, Response } from 'express';

import { parseQnAContent } from '../models/utilities/parser';
import { getRemoteFile as getFile } from '../models/utilities/util';
const execAsync = promisify(exec);

async function getQnaContent(req: Request, res: Response) {
  try {
    const url = decodeURIComponent(req.query.url);
    const multiTurn = req.query.multiTurn === 'true' || req.query.multiTurn === true ? true : false;
    res.status(200).json(await parseQnAContent(url, multiTurn));
  } catch (e) {
    res.status(400).json({
      message: e.message || e.text,
    });
  }
}

async function getRemoteFile(req: Request, res: Response) {
  try {
    const url: string = req.query.url;
    const content = await getFile(url);
    const start = decodeURI(url).lastIndexOf('/');
    const end = decodeURI(url).lastIndexOf('.');
    const id = url.substring(start + 1, end);

    res.status(200).json({
      content,
      id,
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
}

async function checkNodeVersion(req: Request, res: Response) {
  try {
    const command = 'node -v';
    const { stderr: checkNodeError, stdout: nodeVersion } = await execAsync(command);
    if (checkNodeError) {
      throw new Error();
    } else {
      res.status(200).json({
        userHasNode: true,
        nodeVersion: nodeVersion,
      });
    }
  } catch (e) {
    res.status(200).json({
      userHasNode: false,
    });
  }
}

export const UtilitiesController = {
  getQnaContent,
  getRemoteFile,
  checkNodeVersion,
};
