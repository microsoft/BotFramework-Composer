/* eslint @typescript-eslint/no-use-before-define:warn */

import express, { Router, Request, Response } from 'express';

import ProjectHandler from '../handlers/projectHandler';
import { getFiles, updateFile, createFromTemplate } from '../handlers/fileHandler';
import storage from '../storage/StorageService';
import setting from '../storage/SettingService';

const router: Router = express.Router({});
const projectHandler = new ProjectHandler(storage, setting);

router.get('/opened', async (req: Request, res: Response) => {
  const openBot = projectHandler.getOpenBot();
  if (openBot !== null) {
    try {
      const result = await getFiles(openBot.path);
      res.status(200).json({ ...openBot, projectFiles: result });
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(404).json({ error: 'no project open' });
  }
});

router.put('/opened', async (req: Request, res: Response) => {
  try {
    projectHandler.updateOpenBot(req.body);
    res.status(200).json({ result: 'update opened project successfully' });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post('/opened/files', async (req: Request, res: Response) => {
  const { name } = req.body;
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    res.status(400).json({ error: 'Parameter `name` missing.' });
  }

  const lastActiveBot = projectHandler.getOpenBot();

  try {
    await createFromTemplate(req.body.name, req.body.steps, lastActiveBot ? lastActiveBot.path : '');
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// update file in current open project
router.put('/opened/files', async (req: Request, res: Response) => {
  const result = projectHandler.getOpenBot();
  try {
    await updateFile(req.body.name, req.body.content, result.path);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const projectsServerRouter: Router = router;
