import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import config from '../config';


 export class fileServer{
    public router = express.Router({});
    constructor(){
        const botconfig = config.botconfig;
        const botFilePath = botconfig.bot.path;
        const botFileDir = path.dirname(botFilePath);
        const botFileName = botFilePath.substr(botFilePath.lastIndexOf('/') + 1);
        
        this.router.get("/",function(req: any,res: any,next: any){
            let fileList = [];
            try {
                //get .bot file
                let botFileContent = fs.readFileSync(botFilePath, "utf-8");
                fileList.push({name:botFileName, content:botFileContent});
        
                //get 'files' from .bot file
                let botConfig = JSON.parse(botFileContent);
                if(botConfig != undefined && ('files' in botConfig) && botConfig.files instanceof Array){
                    for(let filePath of botConfig.files){
                        let realFilePath = path.join(botFileDir, filePath);
                        if(fs.lstatSync(realFilePath).isFile()){
                            let content = fs.readFileSync(realFilePath, "utf-8");
                            fileList.push({name:filePath, content:content});
                        }
                    }
                }
                res.status(200).json(fileList);
            } catch (error) {
                res.status(400).json({error: 'get file list error'});
            }
        });
        
        
        this.router.put("/", function(req: any, res: any, next: any) {
            try {
                let realFilePath = path.join(botFileDir, req.body.name);
                fs.writeFile(realFilePath, req.body.content, {}, function (err) {
                    if(err) {
                        res.status(400).json({error: 'save error'});
                     } else {
                        res.send('OK');
                     }
                 });
            } catch (error) {
                res.status(400).json({error: 'save error'});
            }
        });
    }
    
    public getRouter(){
        return this.router;
    }
}


