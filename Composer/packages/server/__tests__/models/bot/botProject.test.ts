import path from 'path';
import fs from 'fs';

import { BotProject } from '../../../src/models/bot/botProject';
import { BotProjectRef, FileInfo } from '../../../src/models/bot/interface';

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

describe('getFiles', () => {
  it('should get files at a path', async () => {
    const files: FileInfo[] = await proj.getFiles();
    expect(files.length).toBe(4);
  });
});

describe('updateFile', () => {
  it('should update a file at a path', async () => {
    const initValue = { old: 'value' };
    const newValue = { new: 'value' };

    await proj.updateFile('a.dialog', newValue);
    const aDialog = (await proj.getFiles()).find(f => f.name.startsWith('a'));
    // @ts-ignore
    expect(aDialog.content).toEqual(newValue);
    await proj.updateFile('a.dialog', initValue);
  });
});

describe('createFromTemplate', () => {
  const dialogName = 'MyTestDialog';

  afterEach(() => {
    try {
      fs.unlinkSync(path.resolve(__dirname, `../../mocks/${dialogName}.dialog`));
    } catch (err) {
      // ignore
    }
  });

  it('should create a dialog file with given steps', async () => {
    await proj.createFileFromTemplate(dialogName, ['foo', 'bar', 'baz']);
    const newFile = (await proj.getFiles()).find(f => f.name.startsWith(dialogName));

    if (!newFile) {
      expect(newFile).toBeTruthy();
    }

    const fileContent = (newFile as FileInfo).content;
    expect(fileContent.$type).toEqual('Microsoft.AdaptiveDialog');
    expect(fileContent.rules).toHaveLength(1);
    expect(fileContent.rules[0].steps).toHaveLength(3);
    expect(fileContent.rules[0].steps).toMatchObject([{ $type: 'foo' }, { $type: 'bar' }, { $type: 'baz' }]);
  });
});
