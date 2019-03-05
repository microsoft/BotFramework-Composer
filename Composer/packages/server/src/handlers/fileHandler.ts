import fs from "fs";
import path from "path";
import {config} from "../config";

interface IDirectoryItem {
    name:string,
    path:string,
    scheme:string,
    children: IDirectoryItem[]
}

var botFilePath:string;
var botFileDir:string;
var botFileName:string;

function getAllConfig(botProjFilePath:string): void{
    botFilePath = botProjFilePath;
    botFileDir = path.dirname(botFilePath);
    botFileName = botFilePath.substr(botFilePath.lastIndexOf("\/") + 1);
}

getAllConfig(config.bot.path);

export function getFiles(botProjFilePath:string = ""):any[] {
    if(botProjFilePath) {
        getAllConfig(botProjFilePath);
    }

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

export function updateFile(name:string, content:string, botProjFilePath:string = ""): void {
    if(botProjFilePath) {
        getAllConfig(botProjFilePath);
    }

    let realFilePath:string = path.join(botFileDir, name);
    fs.writeFileSync(realFilePath, content, {});
}

export function getFloderDir(folderPath: string): IDirectoryItem[] {
    let directory:IDirectoryItem[] = [];
    try {
        directory = scanFolder(folderPath)
    } catch(error) {
        console.log(error)
    }

    return directory
}

function scanFolder(folderPath: string): IDirectoryItem[] {
    const folderDir:IDirectoryItem[] = [];
    const items = fs.readdirSync(folderPath);

    items.forEach((item, index) => {
        const itemPath = folderPath+'/'+item;
        const isDirectory = fs.statSync(itemPath).isDirectory()
        const directoryItem: IDirectoryItem = {
            name: item,
            path: itemPath,
            scheme: 'file',
            children: []
        }

        if(isDirectory) {
            directoryItem.scheme = 'folder'
            directoryItem.children = scanFolder(itemPath)
        }

        folderDir.push(directoryItem);
    })

    return folderDir
}