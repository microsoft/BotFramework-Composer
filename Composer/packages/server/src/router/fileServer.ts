import express, { Router, Request, Response } from 'express';

import { getFiles, updateFile, FileInfo, createFromTemplate } from '../handlers/fileHandler';
import setting from '../storage/SettingService';
import storage from '../storage/StorageService';

const router: Router = express.Router({});

router.get('/', async (req: Request, res: Response) => {
  let fileList: FileInfo[] = [];
  const openLastActiveBot = setting.getItem<boolean>('openLastActiveBot');
  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    if (openLastActiveBot) {
      fileList = await getFiles(lastActiveBot);
    }
    res.status(200).json(fileList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/', async (req: Request, res: Response) => {
  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    await updateFile(req.body.name, req.body.content, lastActiveBot);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/new', async (req: Request, res: Response) => {
  const { name } = req.body;
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    res.status(400).json({ error: 'Parameter `name` missing.' });
  }

  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    await createFromTemplate(req.body.name, req.body.steps, lastActiveBot);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const fileServerRouter: Router = router;
