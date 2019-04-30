import { Path } from '../../../../src/utility/path';
import { BotProject } from '../../../../src/models/bot/botProject';
import { BotProjectRef } from '../../../../src/models/bot/interface';

jest.mock('azure-storage', () => {
  return {};
});

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: Path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

describe('Index lg files', () => {
  it('should index the lg file.', async () => {
    const initFiles = [
      {
        name: 'test.lg',
        content: '# greet\n- Hello!',
        path: Path.join(__dirname, '../../mocks/test.lg'),
        relativePath: Path.relative(proj.dir, Path.join(__dirname, '../../mocks/test.lg')),
      },
      {
        name: 'a.dialog',
        content: { old: 'value' },
        path: Path.join(__dirname, '../../mocks/a.dialog'),
        relativePath: Path.relative(proj.dir, Path.join(__dirname, '../../mocks/a.dialog')),
      },
    ];
    const aTemplate = {
      id: 1,
      name: 'greet',
      content: '- Hello!',
      absolutePath: Path.join(__dirname, '../../mocks/test.lg'),
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
