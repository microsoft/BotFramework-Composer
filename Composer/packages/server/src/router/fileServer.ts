import express, { Router } from "express";
import {getFiles,updateFile, getFloderDir} from "../handlers/fileHandler";
import setting from '../storage/SettingService';
import storage from '../storage/StorageService';

const router:Router = express.Router({});

router.get("/",function(req: any,res: any,next: any){
    let fileList:any[] = [];
    const openLastActiveBot = setting.getItem<string>("openLastActiveBot");
    const lastActiveBot = storage.getItem<string>("lastActiveBot");
    try {
        if(openLastActiveBot) {
            fileList = getFiles(lastActiveBot);
        }
        res.status(200).json(fileList);
    } catch (error) {
        res.status(400).json({error: "get file list error"});
    }
});

router.put("/", function(req: any, res: any, next: any) {
    const lastActiveBot = storage.getItem<string>("lastActiveBot");
    try {
        updateFile(req.body.name, req.body.content, lastActiveBot);
    } catch (error) {
        res.status(400).json({error: "save error"});
    }
});

router.get("/open", function(req: any, res: any, next: any) {
    try {
        const folderStructure = getFloderDir("../../../SampleBots");
        res.status(200).json(folderStructure);
    } catch (error) {
        res.status(400).json({error: "save error"});
    }
});

router.get("/openbotFile", function(req: any, res: any, next: any) {
    let fileList:any[] = [];
    if(!req.query.path) {
        res.status(400).json({error: "no path"});
    }

    try {
        fileList = getFiles(req.query.path);
        storage.setItem("lastActiveBot", req.query.path)
        res.status(200).json(fileList);
    } catch (error) {
        res.status(400).json({error: "get file list error"});
    }
});

export const fileServerRouter:Router = router;