import express, { Router } from 'express';
import { globalCache } from "../modal/Cache";
import  storage from "../storage/StorageService";

import fs, { stat } from "fs";

const router: Router = express.Router({});

router.get('/', function (req: any, res: any, next: any) {
    try {
        let storagesList = storage.getItem<Array<object>>('linkedStorages');
        res.status(200).json(storagesList);
    } catch (error) {
        res.status(400).json({ error: 'get storages list error' });
    }
});

// match absolute path
router.get('/:storageId/blobs/*', function (req: any, res: any, next: any) {
    let storageId = req.params.storageId as string;
    let path: string = req.params[0];
    let result;
    try {
        if (storageId === 'default') {
            // return local folder tree, will do lazy load later
            if (path) {
                // if path is a file, then read file and return entry
                fs.stat(path, (err, stat) => {
                    if (err) {
                        throw err;
                    }
                    else if (stat.isFile()) {
                        result = fs.readFileSync(path, 'utf-8');
                        result = JSON.parse(result);
                        res.status(200).json(result);
                        // save to cache
                        globalCache.openBot = {
                            storageId: storageId,
                            path: path
                        }
                        return;
                    } else if (stat.isDirectory()) {
                        let folderTree = getFolderTree(path);
                        result = {
                            name: path.substr(path.lastIndexOf('/') + 1),
                            path: path,
                            children: folderTree
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
                type: "folder",
                path: itemPath
            });
        } else if (tempStat.isFile()) {
            folderTree.push({
                name: item,
                size: tempStat.size,
                type: "file",
                lastModified: tempStat.mtimeMs,
                path: itemPath
            });
        }
    }
    return folderTree;
}

export const storagesServerRouter: Router = router;