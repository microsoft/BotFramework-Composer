import express, { Router } from 'express';
import { getFiles, updateFile, searchFilePath } from '../handlers/fileHandler';
import setting from '../storage/SettingService';
import storage from '../storage/StorageService';

const router: Router = express.Router({});

router.get('/', function(req: any, res: any, next: any) {
  let fileList: any[] = [];
  const openLastActiveBot = setting.getItem<string>('openLastActiveBot');
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

router.get('/openbotFile', function(req: any, res: any, next: any) {
  let fileList: any[] = [];
  if (!req.query.path) {
    res.status(400).json({ error: 'no path' });
  }
  try {
    const pickerWorkingDir = storage.getItem<string>('pickerWorkingDir', '');
    //the limitation of broswer which doens't allows to get the full path of the selected file.
    const path = searchFilePath(pickerWorkingDir, req.query.path);
    if (path === '') {
      res.status(400).json({ error: 'can not find the file' });
      return;
    }
    fileList = getFiles(path);
    storage.setItem('lastActiveBot', path);
    res.status(200).json(fileList);
  } catch (error) {
    res.status(400).json({ error: 'get file list error' });
  }
});

export const fileServerRouter: Router = router;
