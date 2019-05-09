import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';
import { TemplateEngine } from 'botbuilder-lg';

import { FileInfo, LGTemplate, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];
  private storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = path.extname(file.name);
      // todo: use lg parser.
      if (extName === '.lg') {
        TemplateEngine.fromText(file.content);
        const templateStringArray = file.content.split('# ').filter((content: string) => content.trim() !== '');
        const lgTemplates = templateStringArray.map((templateString: string) => {
          const firstLineBreak = templateString.indexOf('\n');
          const name = templateString.substr(0, firstLineBreak).trim();
          const body = templateString.substr(firstLineBreak).trim();
          return { name, body };
        });
        this.lgFiles.push({
          id: path.basename(file.name, extName),
          absolutePath: file.path,
          templates: lgTemplates,
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }

  public async updateLgFile(id: string, templates: LGTemplate[]) {
    const updatedIndex = this.lgFiles.findIndex(template => id === template.id);
    const absolutePath = this.lgFiles[updatedIndex].absolutePath;
    this.lgFiles[updatedIndex].templates = templates;
    let updatedLG = '';
    templates.forEach(template => {
      if (template.name && template.body) {
        updatedLG += `# ${template.name.trim()}` + '\n';
        updatedLG += `${template.body.trim()}` + '\n\n';
      }
    });
    const newFileContent = updatedLG.trim() + '\n';
    TemplateEngine.fromText(newFileContent);
    await this.storage.writeFile(absolutePath, newFileContent);
    return newFileContent;
  }

  public createLgFile = (id: string, templates: string, absolutePath: string) => {
    this.lgFiles.push({ id, templates: [], absolutePath });
    return templates;
  };
}
