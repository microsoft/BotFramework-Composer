import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, LGTemplate } from '../interface';

export class LGIndexer {
  private lgTemplates: LGTemplate[] = [];
  private storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  private getNewTemplate(
    id: number,
    absolutePath: string,
    name: string = '',
    content: string = '',
    comments: string = '',
    parameters: string[] = []
  ) {
    return {
      id: id,
      name: name,
      absolutePath: absolutePath,
      type: 'Rotate',
      content: content,
      comments: comments,
      parameters: parameters,
    };
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];

    const lgTemplates: LGTemplate[] = [];
    let count = 1;

    for (const file of files) {
      const extName = path.extname(file.name);
      const absolutePath = file.path;
      // todo: use lg parser.
      if (extName === '.lg') {
        const lines = file.content.split(/\r?\n/) || [];
        let newTemplate: LGTemplate = this.getNewTemplate(0, '');
        lines.forEach((line: string, index: number) => {
          if (!line.trim() || line.trim().startsWith('>')) {
            if (newTemplate.name) {
              lgTemplates.push(newTemplate);
              newTemplate = this.getNewTemplate(count++, absolutePath, '', line);
            } else if (index === lines.length - 1 && newTemplate.comments) {
              newTemplate.id = count++;
              newTemplate.absolutePath = absolutePath;
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
              newTemplate = this.getNewTemplate(count++, absolutePath);
            }
            newTemplate.id = count;
            newTemplate.name = line.trim().split(' ')[1];
            newTemplate.absolutePath = absolutePath;
            return;
          }

          if (line.trim().startsWith('- DEFAULT') || line.trim().startsWith('- IF')) {
            newTemplate.type = 'Condition';
          }
          newTemplate.content += line + '\n';

          if (newTemplate.name && index === lines.length - 1) {
            newTemplate.id = count++;
            newTemplate.content = newTemplate.content.trim();
            lgTemplates.push(newTemplate);
          }
        });
      }
    }
    this.lgTemplates = lgTemplates;
  }

  public getLgTemplates() {
    return this.lgTemplates;
  }

  public async updateLgTemplate(lgTemplate: LGTemplate) {
    const absolutePath = lgTemplate.absolutePath;
    const updatedIndex = this.lgTemplates.findIndex(template => lgTemplate.id === template.id);
    if (lgTemplate.name && lgTemplate.content) {
      if (updatedIndex < 0) {
        // create a new id if the lg template is not exist and id not provided.
        lgTemplate.id = lgTemplate.id || this.lgTemplates.length + 1;
        this.lgTemplates.push(lgTemplate);
      } else {
        this.lgTemplates[updatedIndex] = lgTemplate;
      }
    }
    let updatedLG = '';
    this.lgTemplates
      .filter(template => template.absolutePath === lgTemplate.absolutePath)
      .forEach(template => {
        if (template.comments) {
          updatedLG += `${template.comments}`;
        }
        if (template.name) {
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
}
