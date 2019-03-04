import fs from "fs";
import path from "path";
import {config} from "../config";

const botFilePath:string = config.bot.path;
const botFileDir:string = path.dirname(botFilePath);
const botFileName:string = botFilePath.substr(botFilePath.lastIndexOf("\/") + 1);

export function getFiles():any[] {
    let fileList:any[] = [];
    // get .bot file
    let botFileContent:string = fs.readFileSync(botFilePath, "utf-8");
    fileList.push({name:botFileName, content:botFileContent});

    // get 'files' from .bot file
    let botConfig:any = JSON.parse(botFileContent);
    if(botConfig !== undefined && ("files" in botConfig) && botConfig.files instanceof Array) {
        for(let filePath of botConfig.files) {
            let realFilePath:string = path.join(botFileDir, filePath);
            if(fs.lstatSync(realFilePath).isFile()) {
                let content:string = fs.readFileSync(realFilePath, "utf-8");
                fileList.push({name:filePath, content:content});
            }
        }
    }

    return fileList;
}

export function updateFile(name:string, content:string): boolean {
    let realFilePath:string = path.join(botFileDir, name);
        fs.writeFile(realFilePath, content, {}, function (err) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });

        return true;
}