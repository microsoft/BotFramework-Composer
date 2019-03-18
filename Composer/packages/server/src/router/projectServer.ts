import express, { Router } from 'express';
import { getFiles } from "../handlers/fileHandler";
import { globalCache } from "../modal/Cache";
import storage from "../storage/StorageService";

const router: Router = express.Router({});

// read from memory
router.get("/opened", function (req: any, res: any, next: any) {
    let openBot = globalCache.openBot ? globalCache.openBot : null;
    if (openBot) {
        res.status(200).json(openBot);
    } else {
        res.status(400).json({ error: 'no project open' });
    }
});

router.post("/opened", function (req: any, res: any, next: any) {

    if (req.body.path) {
        let result = getFiles(req.body.path);
        res.status(200).json(result);
        // update recent open bot
        globalCache.openBot = {
            storageId: "default",
            path: req.body.path
        };
        let openBot = storage.getItem<Array<object>>('recentAccessedBots');
        openBot = openBot ? openBot : [];
        openBot.push(globalCache.openBot);
        storage.setItem('recentAccessedBots', openBot);
    } else {
        res.status(400).json({ error: 'no path' });
    }
});

export const projectsServerRouter: Router = router;
