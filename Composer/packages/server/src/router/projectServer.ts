/* eslint @typescript-eslint/no-use-before-define:warn */

import path from 'path';
import fs from 'fs';

import express, { Router, Request, Response } from 'express';
import produce from 'immer';

import { getParsedObjects, updateFile, createFromTemplate } from '../handlers/fileHandler';
import storage from '../storage/StorageService';
import setting from '../storage/SettingService';
import { FileStorage } from '../storage/FileStorage';

const router: Router = express.Router({});

router.get('/opened', async (req: Request, res: Response) => {
  // check setting file
  const result = projectHandler.checkOpenBotInStorage(storage, setting);
  try {
    const elements = await getParsedObjects(result.path);
    res.status(200).json({ ...result, ...elements });
  } catch (error) {
    res.status(404).json({ error: 'no access project recently' });
  }
});

router.put('/opened', async (req: Request, res: Response) => {
  // check whether the data is completed
  if (req.body.path && req.body.storageId) {
    // path must be a .bot/.botproj file path
    if (path.extname(req.body.path) !== '.bot' && path.extname(req.body.path) !== '.botproj') {
      res
        .status(400)
        .json({ error: 'path error. can not accept this type of file, please give .bot or .botproj file' });
      return;
    }
    // check if the path is correct
    if (!fs.existsSync(req.body.path)) {
      res.status(404).json({ error: 'file not found' });
      return;
    }
    try {
      projectHandler.updateOpenBot(req.body, storage);
      res.status(200).json({ result: 'update opened project successfully' });
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(400).json({ error: 'please give the project path and storageId' });
  }
});

router.put('/opened/projectFile', async (req: Request, res: Response) => {
  const result = projectHandler.checkOpenBotInStorage(storage, setting);
  try {
    const name = `${req.body.name}.botproj`;
    await updateFile(name, req.body.content, result.path);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/opened/dialogs/:id', async (req: Request, res: Response) => {
  const result = projectHandler.checkOpenBotInStorage(storage, setting);
  try {
    const name = `${req.param('id')}.dialog`;
    await updateFile(name, req.body.content, result.path);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/opened/dialogs', async (req: Request, res: Response) => {
  const { name } = req.body;
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    res.status(400).json({ error: 'Parameter `name` missing.' });
  }

  const lastActiveBot = projectHandler.checkOpenBotInStorage(storage, setting);

  try {
    await createFromTemplate(req.body.name, req.body.steps, lastActiveBot ? lastActiveBot.path : '');
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const projectsServerRouter: Router = router;

export const projectHandler = {
  updateOpenBot: (body: any, storage: FileStorage) => {
    body.path = path.normalize(body.path);
    // update recent open bot list
    let recentOpenBots: object[] = storage.getItem('recentAccessedBots', []);

    // if this openBot in List, update position
    const index = recentOpenBots.findIndex((value: any) => {
      return path.resolve(value.path) === body.path;
    });
    const rootPath = process.cwd();
    if (index >= 0) {
      recentOpenBots = produce(recentOpenBots, draft => {
        draft.splice(index, 1);
        const item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path).replace(/\\/g, '/');
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    } else {
      recentOpenBots = produce(recentOpenBots, draft => {
        const item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path).replace(/\\/g, '/');
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    }
    storage.setItem('recentAccessedBots', recentOpenBots);
    return body;
  },
  checkOpenBotInStorage: (storage: FileStorage, setting: FileStorage) => {
    const openLastActiveBot = setting.getItem<boolean>('openLastActiveBot', false);
    const recentOpenBots = storage.getItem('recentAccessedBots', []);
    if (openLastActiveBot && recentOpenBots.length > 0) {
      // deal with relative path
      const result = produce(recentOpenBots[recentOpenBots.length - 1], draft => {
        draft.path = path.resolve(draft.path);
      });
      return result;
    } else {
      return null;
    }
  },
};
