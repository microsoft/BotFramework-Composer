import express, { Router } from 'express';
import { getFiles, updateFile } from '../handlers/fileHandler';
import setting from '../storage/SettingService';
import storage from '../storage/StorageService';

const router: Router = express.Router({});

router.get('/', function(req: any, res: any, next: any) {
  let fileList: any[] = [];
  const openLastActiveBot = setting.getItem<boolean>('openLastActiveBot');
  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    if (openLastActiveBot) {
      fileList = getFiles(lastActiveBot);
    }
    res.status(200).json(fileList);
  } catch (error) {
    res.status(400).json({ error: 'get file list error' });
  }
});

router.put('/', function(req: any, res: any, next: any) {
  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    updateFile(req.body.name, req.body.content, lastActiveBot);
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: 'save error' });
  }
});

export const fileServerRouter: Router = router;
