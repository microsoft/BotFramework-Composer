import fs from 'fs';
import path from 'path';

let botFilePath: string;
let botFileDir: string;
let botFileName: string;

function getAllConfig(botProjFilePath: string): void {
  botFilePath = path.resolve(botProjFilePath);
  botFileDir = path.dirname(botFilePath);
  botFileName = path.basename(botFilePath);
}

export function getFiles(botProjFilePath: string = ''): any[] {
  if (botProjFilePath) {
    getAllConfig(botProjFilePath);
  }

  const fileList: any[] = [];
  // get .bot file
  const botFileContent: string = fs.readFileSync(botFilePath, 'utf-8');
  fileList.push({ name: botFileName, content: botFileContent, path: botFilePath, dir: botFileDir });

  // get 'files' from .bot file
  const botConfig: any = JSON.parse(botFileContent);
  if (botConfig !== undefined && 'files' in botConfig && botConfig.files instanceof Array) {
    for (const filePath of botConfig.files) {
      const realFilePath: string = path.resolve(botFileDir, filePath);
      if (fs.lstatSync(realFilePath).isFile()) {
        const content: string = fs.readFileSync(realFilePath, 'utf-8');
        fileList.push({
          name: filePath,
          content: content,
          path: realFilePath,
          dir: botFileDir,
          relativePath: path.relative(botFileDir, realFilePath),
        });
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
  try {
    const parsed = JSON.parse(content);
    fs.writeFileSync(realFilePath, JSON.stringify(parsed, null, 2), {});
  } catch (err) {
    console.error(err);
  }
}
