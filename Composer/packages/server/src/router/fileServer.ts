import path from 'path';
import { FileStorage } from './../storage/FileStorage';
import express, { Router } from "express";
import {getFiles,updateFile} from "../handlers/fileHandler";

const router:Router = express.Router({});
const storage: FileStorage = new FileStorage(path.resolve('storage.json'), (error) => {console.log(error)});

router.get("/",function(req: any,res: any,next: any){
    let fileList:any[] = [];
    try {
        fileList = getFiles();
        res.status(200).json(fileList);
    } catch (error) {
        res.status(400).json({error: "get file list error"});
    }
});


router.put("/", function(req: any, res: any, next: any) {
    try {
        updateFile(req.body.name, req.body.content);
    } catch (error) {
        res.status(400).json({error: "save error"});
    }
});

export const fileServerRouter:Router = router;