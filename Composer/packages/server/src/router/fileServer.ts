import express, { Router } from "express";
import {getFiles,updateFile} from "../handlers/fileHandler";

const router:Router = express.Router({});

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
        const updateResult:boolean = updateFile(req.body.name, req.body.content);
        if(!updateResult) {
            throw new Error();
        }
    } catch (error) {
        res.status(400).json({error: "save error"});
    }
});


export const fileServerRouter:Router = router;