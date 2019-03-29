/* eslint @typescript-eslint/no-use-before-define:warn */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import express, { Router, Request, Response } from 'express';
import produce from 'immer';

import storage from '../storage/StorageService';
import { FileStorage } from '../storage/FileStorage';

const router: Router = express.Router({});
const fsStat = promisify(fs.stat);

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
            lastModified: tempStat.mtimeMs,
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

  getFilesAndFolders: async (req: Request, res: Response) => {
    let reqPath: string = req.params.path;
    if (!reqPath || !path.isAbsolute(reqPath)) {
      res.status(400).json({ error: 'no path or path is not absolute' });
      return;
    }
    let result: any;
    try {
      const stat = await fsStat(reqPath);
      reqPath = path.normalize(reqPath);
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
      return;
    }
    res.status(200).json(result);
    return;
  },
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const storagesList = storageHandler.getStorage(storage);
    res.status(200).json(storagesList);
  } catch (error) {
    res.status(400).json({ error: 'get storages error' });
  }
});

// match absolute path
router.get('/:storageId/blobs/:path(*)', storageHandler.getFilesAndFolders);

export const storagesServerRouter: Router = router;
