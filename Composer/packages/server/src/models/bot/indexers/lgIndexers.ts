import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { FileInfo, LGTemplate } from './../interface';

export class LGIndexer {
  private lgTemplates: LGTemplate[] = [];
  private writeFile = promisify(fs.writeFile);
  private getNewTemplate(
    id: number,
    fileName: string,
    name: string = '',
    content: string = '',
    comments: string = '',
    parameters: string[] = []
  ) {
    return {
      id: id,
      name: name,
      fileName: fileName,
      type: 'Rotate',
      content: content,
      comments: comments,
      parameters: parameters,
    };
  }

  public addLgFiles(files: FileInfo[]) {
    if (files.length === 0) return [];

    const lgTemplates: LGTemplate[] = [];
    let count = 1;

    for (const file of files) {
      const extName = path.extname(file.name);
      const fileName = path.basename(file.name, extName);
      // todo: use lg parser.
      if (extName === '.lg') {
        const lines = file.content.split(/\r?\n/) || [];
        let newTemplate: LGTemplate = this.getNewTemplate(0, '');
        lines.forEach((line: string, index: number) => {
          if (!line.trim() || line.trim().startsWith('>')) {
            if (newTemplate.name) {
              lgTemplates.push(newTemplate);
              newTemplate = this.getNewTemplate(count++, fileName, '', line);
            } else if (index === lines.length - 1 && newTemplate.comments) {
              newTemplate.id = count++;
              newTemplate.fileName = fileName;
              newTemplate.comments += line;
              lgTemplates.push(newTemplate);
            } else {
              newTemplate.comments += line + '\n';
            }
            return;
          }

          if (line.trim().startsWith('#')) {
            if (newTemplate.name) {
              lgTemplates.push(newTemplate);
              newTemplate = this.getNewTemplate(count++, fileName);
            }
            newTemplate.id = count;
            newTemplate.name = line.trim().split(' ')[1];
            newTemplate.fileName = path.basename(file.name, extName);
            return;
          }

          if (line.trim().startsWith('- DEFAULT') || line.trim().startsWith('- IF')) {
            newTemplate.type = 'Condition';
          }
          newTemplate.content += line + '\n';

          if (newTemplate.name && index === lines.length - 1) {
            newTemplate.id = count++;
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

  public async updateLgTemplate(absolutePath: string, lgTemplate: LGTemplate) {
    const updatedIndex = this.lgTemplates.findIndex(template => lgTemplate.id === template.id);
    if (updatedIndex >= 0) {
      this.lgTemplates[updatedIndex] = lgTemplate;
      let updatedLG = '';
      this.lgTemplates
        .filter(template => template.fileName === lgTemplate.fileName)
        .forEach(template => {
          if (template.comments) {
            updatedLG += `${template.comments}`;
          }
          if (template.name) {
            updatedLG += `# ${template.name}` + '\n';
            updatedLG += `${template.content}` + '\n';
          }
        });
      await this.writeFile(absolutePath, updatedLG);
    } else {
      throw new Error(`Lg template not found, id: ${lgTemplate.id}`);
    }
  }
}
