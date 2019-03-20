import express, { Router } from 'express';
import storage from '../storage/StorageService';
import { IStorageInterface } from '../modal/IStorageInterface';
import fs from 'fs';

const router: Router = express.Router({});

router.get('/', function(req: any, res: any, next: any) {
  try {
    let storagesList = storage.getItem<string>('linkedStorages', '[]');
    storagesList = JSON.parse(storagesList);
    res.status(200).json(storagesList);
  } catch (error) {
    res.status(400).json({ error: 'get storages list error' });
  }
});

// match absolute path
router.get('/:storageId/blobs/:path(*)', function(req: any, res: any, next: any) {
  let storageId: string = req.params.storageId;
  let path: string = req.params.path;
  if (!path) {
    res.status(400).json({ error: 'no path' });
    return;
  }
  let result: any;
  fs.stat(path, (err, stat) => {
    if (err) {
      res.status(404).json(err);
      return;
    }

    if (stat.isFile()) {
      result = fs.readFileSync(path, 'utf-8');
      result = JSON.parse(result);
    } else if (stat.isDirectory()) {
      let folderTree = getFolderTree(path);
      result = {
        name: path.substr(path.lastIndexOf('/') + 1),
        path: path,
        children: folderTree,
      };
    }
    res.status(200).json(result);
  });
});

// get current layer files list
const getFolderTree = (folderPath: string) => {
  let folderTree = [] as object[];
  let items = fs.readdirSync(folderPath);

  for (let item of items) {
    let itemPath = `${folderPath}/${item}`;
    let tempStat = fs.statSync(itemPath);

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
  }
  return folderTree;
};

export const storagesServerRouter: Router = router;
