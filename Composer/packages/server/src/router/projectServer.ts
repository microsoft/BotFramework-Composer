import express, { Router } from 'express';
import { getFiles } from '../handlers/fileHandler';
import storage from '../storage/StorageService';
import setting from '../storage/SettingService';
import { FileStorage } from '../storage/FileStorage';
import path from 'path';
import produce from 'immer';

const router: Router = express.Router({});
let openBot: any | undefined;

// read from memory
router.get('/opened', function(req: any, res: any, next: any) {
  if (openBot) {
    res.status(200).json(openBot);
    return;
  }
  // check setting file
  openBot = projectHandler.checkOpenBotInStorage(storage, setting);
  if (openBot !== null) {
    res.status(200).json(openBot);
  } else {
    res.status(404).json({ error: 'no project open' });
  }
});

// update memory
router.put('/opened', function(req: any, res: any, next: any) {
  // check whether the data is completed
  if (req.body.path && req.body.storageId) {
    openBot = projectHandler.updateOpenBot(req.body, storage);
    res.status(200).json({ result: 'update opened project successfully' });
  } else {
    res.status(400).json({ error: 'please give the project path and storageId' });
  }
});

router.get('/opened/files', function(req: any, res: any, next: any) {
  if (openBot) {
    // load local project
    let result = getFiles(openBot.path);
    res.status(200).json(result);
  } else {
    res.status(400).json({ error: "haven't open a project" });
  }
});

export const projectsServerRouter: Router = router;

export const projectHandler = {
  updateOpenBot: (body: any, storage: FileStorage) => {
    body.path = path.normalize(body.path);
    // update recent open bot list
    let recentOpenBots: Array<object> = storage.getItem('recentAccessedBots', []);

    // if this openBot in List, update position
    let index = recentOpenBots.findIndex((value: any) => {
      return path.resolve(value.path) === body.path;
    });
    const rootPath = process.cwd();
    if (index >= 0) {
      recentOpenBots = produce(recentOpenBots, draft => {
        draft.splice(index, 1);
        let item: any;
        item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path);
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    } else {
      recentOpenBots = produce(recentOpenBots, draft => {
        let item;
        item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path);
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    }
    storage.setItem('recentAccessedBots', recentOpenBots);
    return body;
  },
  checkOpenBotInStorage: (storage: FileStorage, setting: FileStorage) => {
    const openLastActiveBot = setting.getItem<boolean>('openLastActiveBot', false);
    let recentOpenBots = storage.getItem('recentAccessedBots', []);
    if (openLastActiveBot && recentOpenBots.length > 0) {
      // deal with relative path
      recentOpenBots[recentOpenBots.length - 1].path = path.resolve(recentOpenBots[recentOpenBots.length - 1].path);
      return recentOpenBots[recentOpenBots.length - 1];
    } else {
      return null;
    }
  },
};
