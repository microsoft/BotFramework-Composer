import express, { Router } from 'express';
import storage from "../storage/StorageService";
import { IStorageInterface } from "../modal/IStorageInterface";
import fs, { stat } from "fs";

const router: Router = express.Router({});

router.get('/', function (req: any, res: any, next: any) {
    try {
        let storagesList = storage.getItem<string>('linkedStorages');
        storagesList = storagesList ? JSON.parse(storagesList) : ([] as object[]);
        res.status(200).json(storagesList);
    } catch (error) {
        res.status(400).json({ error: 'get storages list error' });
    }
});

router.post('/', function (req: any, res: any, next: any) {
    try {
        let storagesList: any = storage.getItem<string>('linkedStorages');
        storagesList = storagesList ? JSON.parse(storagesList) : ([] as object[]);
        let temp = req.body;
        temp.id = `randomGenerated ${storagesList.length}`;
        storagesList.push(temp);
        storage.setItem('linkedStorages', JSON.stringify(storagesList));
        res.status(200).json({ result: "create storage done" });
    } catch (err) {
        res.status(400).json({ error: 'create storage error' });
    }
});

router.delete('/', function (req: any, res: any, next: any) {
    try {
        let storagesList: any = storage.getItem<string>('linkedStorages');
        storagesList = storagesList ? JSON.parse(storagesList) : ([] as object[]);
        if (storagesList && req.body.storageId) {
            let index = storagesList.findIndex((storage: IStorageInterface) => storage.id === req.body.storageId);
            if (index >= 0) {
                storagesList.splice(index, 1);
                storage.setItem('linkedStorages', JSON.stringify(storagesList));
            }
        }
        res.status(200).json(storagesList);
    } catch (error) {
        res.status(400).json({ error: 'get storages list error' });
    }
});

// match absolute path
router.get('/:storageId/blobs/:path(*)', function (req: any, res: any, next: any) {
    let storageId: string = req.params.storageId;
    let path: string = req.params.path;
    let result: object;
    if (!path) {
        res.status(400).json({ error: 'no path' });
        return;
    }
    try {
        fs.stat(path, (err, stat) => {
            if (err) {
                throw err;
            }
            if (stat.isFile()) {
                result = JSON.parse(fs.readFileSync(path, 'utf-8'));
                // save to cache
                storage.setItem("openBot", {
                    storageId: storageId,
                    path: path
                });

            } else if (stat.isDirectory()) {
                let folderTree = getFolderTree(path);
                result = {
                    name: path.substr(path.lastIndexOf('/') + 1),
                    path: path,
                    children: folderTree
                }

            }
            res.status(200).json(result);
        });
    }
    catch (error) {
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