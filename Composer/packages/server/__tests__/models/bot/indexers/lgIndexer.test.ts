import path from 'path';

import { BotProject } from '../../../../src/models/bot/botProject';
import { BotProjectRef } from '../../../../src/models/bot/interface';

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

describe('Index lg files', () => {
  it('should index the lg file.', async () => {
    const initFiles = [
      { name: 'test.lg', content: '# greet\n- Hello!' },
      { name: 'a.dialog', content: { old: 'value' } },
    ];
    const aTemplate = {
      id: 1,
      name: 'greet',
      content: '- Hello!',
      fileName: 'test',
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
