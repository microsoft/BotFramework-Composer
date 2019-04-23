import path from 'path';

import { BotProject } from '../../../../src/models/bot/botProject';
import { BotProjectRef } from '../../../../src/models/bot/interface';

jest.mock('azure-storage', () => {
  return {};
});

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

describe('Index lg files', () => {
  it('should index the lg file.', async () => {
    const initFiles = [
      {
        name: 'test.lg',
        content: '# greet\n- Hello!',
        path: path.join(__dirname, '../../mocks/test.lg'),
        relativePath: path.relative(proj.dir, path.join(__dirname, '../../mocks/test.lg')),
      },
      {
        name: 'a.dialog',
        content: { old: 'value' },
        path: path.join(__dirname, '../../mocks/a.dialog'),
        relativePath: path.relative(proj.dir, path.join(__dirname, '../../mocks/a.dialog')),
      },
    ];
    const aTemplate = {
      id: 1,
      name: 'greet',
      content: '- Hello!',
      absolutePath: path.join(__dirname, '../../mocks/test.lg'),
      parameters: [],
      type: 'Rotate',
      comments: '',
    };
    await proj.lgIndexer.index(initFiles);

    const lgTemplates = await proj.lgIndexer.getLgTemplates();
    // @ts-ignore
    expect(lgTemplates.length).toEqual(1);
    expect(aTemplate).toEqual(lgTemplates[0]);
  });
});
