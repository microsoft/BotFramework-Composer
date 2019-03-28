/* eslint @typescript-eslint/no-use-before-define:warn */

import fs from 'fs';
import path from 'path';

import express, { Router } from 'express';
import produce from 'immer';

import storage from '../storage/StorageService';
import { FileStorage } from '../storage/FileStorage';

const router: Router = express.Router({});

router.get('/', function(req: any, res: any, next: any) {
  try {
    const storagesList = storageHandler.getStorage(storage);
    res.status(200).json(storagesList);
  } catch (error) {
    res.status(400).json({ error: 'get storages error' });
  }
});

// match absolute path
router.get('/:storageId/blobs/:path(*)', function(req: any, res: any, next: any) {
  let reqPath: string = req.params.path;
  if (!reqPath) {
    res.status(400).json({ error: 'no path' });
    return;
  }
  let result: any;
  fs.stat(reqPath, (err, stat) => {
    if (err) {
      res.status(404).json(err);
      return;
    }
    // deal with root path incomplete
    reqPath = reqPath + '/';
    reqPath = path.normalize(reqPath);
    try {
      if (stat.isFile()) {
        result = fs.readFileSync(reqPath, 'utf-8');
        result = JSON.parse(result);
      } else if (stat.isDirectory()) {
        const folderTree = storageHandler.getFolderTree(reqPath);

        result = {
          name: path.basename(reqPath),
          parent: path.dirname(reqPath),
          children: folderTree,
        };
      }
    } catch (error) {
      res.status(400).json(error);
    }
    res.status(200).json(result);
  });
});

export const storagesServerRouter: Router = router;

// decouple all handlers for easy testing
export const storageHandler = {
  getStorage: (_storage: FileStorage) => {
    try {
      const storagesList = produce(_storage.getItem('linkedStorages', []), draft => {
        for (const item of draft) {
          if (item.type === 'LocalDrive') {
            // deal with relative path
            item.path = path.resolve(item.path);
            item.path = path.normalize(item.path);
          }
        }
      });
      return storagesList;
    } catch (error) {
      return error;
    }
  },
  // get current layer files list
  getFolderTree: (folderPath: string) => {
    const folderTree = [] as object[];
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      try {
        const itemPath = path.join(folderPath, item);
        const tempStat = fs.statSync(itemPath);
        if (tempStat.isDirectory()) {
          folderTree.push({
            name: item,
            type: 'folder',
            path: itemPath,
          });
        } else if (tempStat.isFile()) {
          folderTree.push({
            name: item,
            size: tempStat.size,
            type: 'file',
            lastModified: tempStat.mtimeMs,
            path: itemPath,
          });
        }
      } catch (error) {
        // log error, and continute getting the path which can access
        console.log(error);
        continue;
      }
    }
    return folderTree;
  },
};
