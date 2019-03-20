import express, { Router } from 'express';
import { getFiles } from '../handlers/fileHandler';
import storage from '../storage/StorageService';
import setting from '../storage/SettingService';
import { object } from 'prop-types';

const router: Router = express.Router({});
let openBot: any | undefined;

// read from memory
router.get('/opened', function(req: any, res: any, next: any) {
  if (openBot) {
    res.status(200).json(openBot);
    return;
  }
  // check setting file
  const openLastActiveBot = setting.getItem<boolean>('openLastActiveBot', false);
  let recentOpenBots = storage.getItem<string>('recentAccessedBots', '[]');
  recentOpenBots = JSON.parse(recentOpenBots);
  if (openLastActiveBot && recentOpenBots.length > 0) {
    openBot = recentOpenBots[recentOpenBots.length - 1];
    res.status(200).json(openBot);
  } else {
    res.status(404).json({ error: 'no project open' });
  }
});

// update memory
router.put('/opened', function(req: any, res: any, next: any) {
  // check whether the data is completed
  if (req.body.path && req.body.storageId) {
    openBot = req.body;

    // update recent open bot list
    let recentOpenBots = storage.getItem<string>('recentAccessedBots', '[]');
    recentOpenBots = JSON.parse(recentOpenBots);
    recentOpenBots.push(openBot);
    storage.setItem('recentAccessedBots', JSON.stringify(recentOpenBots));

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
