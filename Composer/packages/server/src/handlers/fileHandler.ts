import fs from 'fs';
import path from 'path';

var botFilePath: string;
var botFileDir: string;
var botFileName: string;

function getAllConfig(botProjFilePath: string): void {
  botFilePath = botProjFilePath;
  botFileDir = path.dirname(botFilePath);
  botFileName = botFilePath.substr(botFilePath.lastIndexOf('/') + 1);
}

export function getFiles(botProjFilePath: string = ''): any[] {
  if (botProjFilePath) {
    getAllConfig(botProjFilePath);
  }

  const fileList: any[] = [];
  // get .bot file
  const botFileContent: string = fs.readFileSync(botFilePath, 'utf-8');
  fileList.push({ name: botFileName, content: botFileContent });

  // get 'files' from .bot file
  const botConfig: any = JSON.parse(botFileContent);
  if (botConfig !== undefined && 'files' in botConfig && botConfig.files instanceof Array) {
    for (const filePath of botConfig.files) {
      const realFilePath: string = path.join(botFileDir, filePath);
      if (fs.lstatSync(realFilePath).isFile()) {
        const content: string = fs.readFileSync(realFilePath, 'utf-8');
        fileList.push({ name: filePath, content: content });
      }
    }
  }

  return fileList;
}

export function updateFile(name: string, content: string, botProjFilePath: string = ''): void {
  if (botProjFilePath) {
    getAllConfig(botProjFilePath);
  }

  const realFilePath: string = path.join(botFileDir, name);
  fs.writeFileSync(realFilePath, content, {});
}

export function searchFilePath(folderPath: any, fileName: string): string {
  const items = fs.readdirSync(folderPath);
  let path = '';

  for (const item of items) {
    const itemPath = folderPath + '/' + item;
    if (item === fileName) {
      return itemPath;
    } else {
      const isDirectory = fs.statSync(itemPath).isDirectory();

      if (isDirectory && path === '') {
        path = searchFilePath(itemPath, fileName);
      }
    }
  }
  console.log(path);
  return path;
}
