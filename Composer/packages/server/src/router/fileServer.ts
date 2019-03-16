import express, { Router } from 'express';
import { getFiles, updateFile, searchFilePath, getFolderTree, FolderTree } from '../handlers/fileHandler';
import setting from '../storage/SettingService';
import storage from '../storage/StorageService';
import { IStorageInterface } from '../storage/IStorageInterface';
import fs, { stat } from "fs";
const router: Router = express.Router({});
let currentOpenBot:object|null = null; // for cache
router.get('/storages', function (req: any, res: any, next: any) {
  try {
    let storagesList = storage.getItem<Array<object>>('linkedStorages');
    res.status(200).json(storagesList);
  } catch (error) {
    res.status(400).json({ error: 'get storages list error' });
  }
});

// match absolute path
router.get('/storages/:storageId/:blob/*', function (req: any, res: any, next: any) {
  let storageId = req.params.storageId as string;
  let path: string = req.params[0] ? `${req.params.blob}/${req.params[0]}` : req.params.blob;
  let folderTree: FolderTree = {
    folders: [],
    files: []
  };
  let result;
  try {
    if (storageId === 'default') {
      // return local folder tree, will do lazy load later
      if (req.params.blob) {
        // if path is a file, then read file and return entry
        fs.stat(path, (err, stat) => {
          if (err) {
            throw err;
          }
          else if (stat.isFile()) {
            result = getFiles(path);
            res.status(200).json(result);
            // save to cache
            currentOpenBot = {
              storageId: storageId,
              path: path
            }
            return;
          } else if (stat.isDirectory()) {
            getFolderTree(path, folderTree);
            result = {
              name: path.substr(path.lastIndexOf('/')+1),
              parent: path.substr(0, path.lastIndexOf('/')),
              folderTree: folderTree
            }
            res.status(200).json(result);
            return;
          }
        })
      } else {
        res.status(400).json({ error: 'no path' });
        return;
      }
    }
  } catch (error) {
    res.status(400).json({ error: 'get storages files error' });
    return;
  }
});

router.get("/projects/opened", function (req: any, res: any, next: any) {
  if(currentOpenBot!==null){
    res.status(200).json(currentOpenBot);
  } else {
    res.status(400).json({ error: 'no project open' });
  }
});

router.get('/', function (req: any, res: any, next: any) {
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

router.put('/', function (req: any, res: any, next: any) {
  const lastActiveBot = storage.getItem<string>('lastActiveBot');

  try {
    updateFile(req.body.name, req.body.content, lastActiveBot);
  } catch (error) {
    res.status(400).json({ error: 'save error' });
  }
});

router.get('/openbotFile', function (req: any, res: any, next: any) {
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
