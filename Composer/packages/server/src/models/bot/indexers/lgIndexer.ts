import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, LGTemplate, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];
  private storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  private getNewTemplate(name: string = '', content: string = '', comments: string = '', parameters: string[] = []) {
    return {
      name: name,
      type: 'Rotate',
      content: content,
      comments: comments,
      parameters: parameters,
    };
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const lgTemplates: LGTemplate[] = [];
      const extName = path.extname(file.name);
      // todo: use lg parser.
      if (extName === '.lg') {
        const lines = file.content.split(/\r?\n/) || [];
        let newTemplate: LGTemplate = this.getNewTemplate();
        lines.forEach((line: string, index: number) => {
          if (!line.trim() || line.trim().startsWith('>')) {
            if (newTemplate.name) {
              lgTemplates.push(newTemplate);
              newTemplate = this.getNewTemplate('', line);
            } else if (index === lines.length - 1 && newTemplate.comments) {
              newTemplate.comments += line;
              newTemplate.content = newTemplate.content.trim();
              lgTemplates.push(newTemplate);
            } else {
              newTemplate.comments += line + '\n';
            }
            return;
          }

          if (line.trim().startsWith('#')) {
            if (newTemplate.name) {
              newTemplate.content = newTemplate.content.trim();
              lgTemplates.push(newTemplate);
              newTemplate = this.getNewTemplate();
            }
            newTemplate.name = line.split('#')[1].trim();
            return;
          }

          if (line.trim().startsWith('- DEFAULT') || line.trim().startsWith('- IF')) {
            newTemplate.type = 'Condition';
          }
          newTemplate.content += line + '\n';

          if (newTemplate.name && index === lines.length - 1) {
            newTemplate.content = newTemplate.content.trim();
            lgTemplates.push(newTemplate);
          }
        });
        this.lgFiles.push({
          id: path.basename(file.name, '.lg'),
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
      if (template.comments) {
        updatedLG += `${template.comments}`;
      }
      if (template.name && template.content) {
        if (template.content.indexOf('- IF') !== -1 || template.content.indexOf('- DEFAULT') !== -1) {
          template.type = 'Condition';
        } else {
          template.type = 'Rotate';
        }
        updatedLG += `# ${template.name}` + '\n';
        updatedLG += `${template.content}` + '\n';
      }
    });
    const newFileContent = updatedLG.trim() + '\n';
    await this.storage.writeFile(absolutePath, newFileContent);
    return newFileContent;
  }

  public createLgFile = (id: string, templates: string, absolutePath: string) => {
    this.lgFiles.push({ id, templates: [], absolutePath });
    return templates;
  };
}
