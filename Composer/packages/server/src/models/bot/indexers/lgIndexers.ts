import path from 'path';

import { FileInfo, LGTemplate } from './../interface';

export function lgIndexer(files: FileInfo[]) {
  if (files.length === 0) return [];

  const lgTemplates: LGTemplate[] = [];
  let count = 1;

  for (const file of files) {
    const extName = path.extname(file.name);
    const fileName = path.basename(file.name, extName);
    // todo: use lg parser.
    if (extName === '.lg') {
      const lines = file.content.split(/\r?\n/) || [];
      let newTemplate: LGTemplate = getNewTemplate(0, '', '', '');
      lines.forEach((line: string, index: number) => {
        if (!line.trim() || line.trim().startsWith('>')) {
          if (newTemplate.name) {
            lgTemplates.push(newTemplate);
            newTemplate = getNewTemplate(count++, fileName, '', line);
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
            newTemplate = getNewTemplate(count++, fileName, '', '');
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
  console.log(lgTemplates);
  return lgTemplates;
}

function getNewTemplate(id: number, fileName: string, content: string, comments: string) {
  return {
    id: id,
    name: '',
    fileName: fileName,
    type: 'Rotate',
    content: content,
    comments: comments,
  };
}
