/* eslint @typescript-eslint/no-use-before-define:warn */

import express, { Router, Request, Response } from 'express';

import ProjectHandler from '../handlers/projectHandler';
import { getFiles } from '../handlers/fileHandler';
import storage from '../storage/StorageService';
import setting from '../storage/SettingService';

const router: Router = express.Router({});
const projectHandler = new ProjectHandler(storage, setting);

router.get('/opened', async (req: Request, res: Response) => {
  const openBot = projectHandler.getOpenBot();
  if (openBot !== null) {
    res.status(200).json(openBot);
    return;
  } else {
    res.status(404).json({ error: 'no project open' });
  }
});

// update memory
router.put('/opened', async (req: Request, res: Response) => {
  try {
    projectHandler.updateOpenBot(req.body);
    res.status(200).json({ result: 'update opened project successfully' });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/opened/files', async (req: Request, res: Response) => {
  const openBot = projectHandler.getOpenBot();
  if (openBot) {
    // load local project
    try {
      const result = await getFiles(openBot.path);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(400).json({ error: "haven't open a project" });
  }
});

export const projectsServerRouter: Router = router;
