import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { file } from '@babel/types';

var botFilePath: string;
var botFileDir: string;
var botFileName: string;
export interface FolderTree {
  folders: Folder[],
  files: File[]
};
interface File {
  name: string,
  lastModified: number,
  size: number,
  parent: string
}
interface Folder {
  name: string,
  parent: string,
}
function getAllConfig(botProjFilePath: string): void {
  botFilePath = botProjFilePath;
  botFileDir = path.dirname(botFilePath);
  botFileName = botFilePath.substr(botFilePath.lastIndexOf('/') + 1);
}

getAllConfig(config.bot.path);

export function getFiles(botProjFilePath: string = ''): any[] {
  if (botProjFilePath) {
    getAllConfig(botProjFilePath);
  }

  let fileList: any[] = [];
  // get .bot file
  let botFileContent: string = fs.readFileSync(botFilePath, 'utf-8');
  fileList.push({ name: botFileName, content: botFileContent });

  // get 'files' from .bot file
  let botConfig: any = JSON.parse(botFileContent);
  if (botConfig !== undefined && 'files' in botConfig && botConfig.files instanceof Array) {
    for (let filePath of botConfig.files) {
      let realFilePath: string = path.join(botFileDir, filePath);
      if (fs.lstatSync(realFilePath).isFile()) {
        let content: string = fs.readFileSync(realFilePath, 'utf-8');
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

  let realFilePath: string = path.join(botFileDir, name);
  fs.writeFileSync(realFilePath, content, {});
}

export function searchFilePath(folderPath: any, fileName: string): string {
  const items = fs.readdirSync(folderPath);
  let path = '';

  for (let item of items) {
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

export const getFolderTree = (folderPath: string, folderTree: FolderTree) => {
  let lastName = folderPath.substr(folderPath.lastIndexOf('/') + 1);
  let fileStat = fs.statSync(folderPath);
  if (fileStat.isFile()) {
    folderTree.files.push({
      name: lastName,
      parent: path.dirname(folderPath),
      size: fileStat.size,
      lastModified: fileStat.mtimeMs
    } as File);
    return folderTree;
  }

  let items = fs.readdirSync(folderPath);

  for (let item of items) {
    let itemPath = `${folderPath}/${item}`;
    let tempStat = fs.statSync(itemPath);

    if (tempStat.isDirectory()) {
      folderTree.folders.push({
        name: item,
        parent: lastName
      } as Folder);
      getFolderTree(itemPath, folderTree);
    } else if (tempStat.isFile()) {
      folderTree.files.push({
        name: item,
        parent: lastName,
        size: tempStat.size,
        lastModified: tempStat.mtimeMs
      } as File);
    }
  }
  return folderTree;
}


// export function getFolderTree(folderPath: string, folderTree: FolderTree) {
//   let lastName = folderPath.substr(folderPath.lastIndexOf('/') + 1);
//   fs.stat(folderPath, (err, stat) => {
//     if (err) {
//       throw err;
//     }
//     if (stat.isFile()) {
//       folderTree.files.push({
//         name: lastName,
//         parent: path.dirname(folderPath),
//         size: stat.size,
//         lastModified: stat.mtimeMs
//       } as File);
//       return folderTree;
//     } else {
//       let items = fs.readdirSync(folderPath);

//       for (let item of items) {
//         let itemPath = `${folderPath}/${item}`;
//         fs.stat(itemPath, (err, stat) => {
//           if (err) {
//             throw err;
//           }
//           if (stat.isDirectory()) {
//             folderTree.folders.push({
//               name: item,
//               parent: lastName
//             } as Folder);
//             getFolderTree(itemPath, folderTree);
//           } else if (stat.isFile()) {
//             folderTree.files.push({
//               name: item,
//               parent: lastName,
//               size: stat.size,
//               lastModified: stat.mtimeMs
//             } as File);
//           }
//           return folderTree;
//         });
//       }
//     }

//   });
// }

