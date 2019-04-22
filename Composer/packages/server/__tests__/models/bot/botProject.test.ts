import path from 'path';
import fs from 'fs';

import { BotProject } from '../../../src/models/bot/botProject';
import { BotProjectRef, FileInfo } from '../../../src/models/bot/interface';

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

describe('getProject', () => {
  it('should get files at a path', async () => {
    await proj.init();
    const project: { [key: string]: any } = await proj.getProject();
    expect(project.dialogs.length).toBe(3);
  });
});

describe('updateDialog', () => {
  it('should update a file at a path', async () => {
    const initValue = { old: 'value' };
    const newValue = { new: 'value' };

    const dialogs = await proj.updateDialog('a', newValue);
    const aDialog = dialogs.find(f => f.name.startsWith('a'));
    // @ts-ignore
    expect(aDialog.content).toEqual(newValue);
    await proj.updateDialog('a', initValue);
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
    const dialogs = await proj.createDialogFromTemplate(dialogName, ['foo', 'bar', 'baz']);
    const newFile = dialogs.find(f => f.name.startsWith(dialogName));

    if (!newFile) {
      expect(newFile).toBeTruthy();
    }

    const fileContent = ((newFile as unknown) as FileInfo).content;
    expect(fileContent.$type).toEqual('Microsoft.AdaptiveDialog');
    expect(fileContent.rules).toHaveLength(1);
    expect(fileContent.rules[0].steps).toHaveLength(3);
    expect(fileContent.rules[0].steps).toMatchObject([{ $type: 'foo' }, { $type: 'bar' }, { $type: 'baz' }]);
  });
});
