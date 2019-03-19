import express, { Router } from 'express';
import { getFiles } from "../handlers/fileHandler";
import storage from "../storage/StorageService";

const router: Router = express.Router({});

// read from memory
router.get("/opened", function (req: any, res: any, next: any) {
    let openBot = storage.getItem<object>("openBot");
    if (openBot) {
        res.status(200).json(openBot);
    } else {
        res.status(400).json({ error: 'no project open' });
    }
});

router.post("/opened", function (req: any, res: any, next: any) {
    if (req.body.path && req.body.storageId === "default") {
        // load local project
        let result = getFiles(req.body.path);
        res.status(200).json(result);
        // update recent open bot
        let recentOpenBots: any = storage.getItem<string>('recentAccessedBots');
        recentOpenBots = recentOpenBots ? JSON.parse(recentOpenBots) : [] as object[];
        let openBot = {
            storageId: req.body.storageId,
            path: req.body.path
        };
        recentOpenBots.push(openBot);
        storage.setItem("openBot", openBot);
        storage.setItem('recentAccessedBots', JSON.stringify(recentOpenBots));
    } else {
        res.status(400).json({ error: 'no path' });
    }
});

export const projectsServerRouter: Router = router;
