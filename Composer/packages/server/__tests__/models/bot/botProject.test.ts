import path from 'path';
import fs from 'fs';

import { BotProject } from '../../../src/models/bot/botProject';
import { BotProjectRef, FileInfo } from '../../../src/models/bot/interface';

jest.mock('azure-storage', () => {
  return {};
});

const mockProjectRef: BotProjectRef = {
  storageId: 'default',
  path: path.join(__dirname, '../../mocks/1.botproj'),
};

const proj = new BotProject(mockProjectRef);

beforeEach(async () => {
  await proj.index();
});

describe('index', () => {
  it('should get project', async () => {
    const project: { [key: string]: any } = await proj.getIndexes();
    expect(project.dialogs.length).toBe(3);
  });
});

describe('updateDialog', () => {
  it('should update a file at a path', async () => {
    const initValue = { old: 'value' };
    const newValue = { new: 'value' };
    const dialogs = await proj.updateDialog('a', newValue);
    const aDialog = dialogs.find((f: { name: string }) => f.name.startsWith('a'));
    // @ts-ignore
    expect(aDialog.content).toEqual(newValue);
    await proj.updateDialog('a', initValue);
  });
});

describe('updateBotFile', () => {
  it('should update a file at a path', async () => {
    const initValue = { services: [], files: ['*.dialog', '*.lg'], entry: 'main.dialog' };
    const newValue = { services: ['test'], files: ['*.dialog', '*.lg'], entry: 'main.dialog' };
    const botFile = await proj.updateBotFile('1', newValue);
    // @ts-ignore
    expect(botFile.content).toEqual(newValue);
    await proj.updateBotFile('1', initValue);
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
    const newFile = dialogs.find((f: { name: string }) => f.name.startsWith(dialogName));

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

const copyDir = path.join(__dirname, `../../copy`);

describe('copyTo', () => {
  const projectRef: BotProjectRef = {
    storageId: 'default',
    path: path.join(__dirname, '../../copy/1.botproj'),
  };

  afterEach(() => {
    try {
      const deleteFolder = (path: string) => {
        let files = [];
        if (fs.existsSync(path)) {
          files = fs.readdirSync(path);
          files.forEach(function(file, index) {
            const curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
              // recurse
              deleteFolder(curPath);
            } else {
              // delete file
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
      };
      deleteFolder(copyDir);
    } catch (err) {
      // ignore
    }
  });

  it('should create a dialog file with given steps', async () => {
    const newBotProject = await proj.copyTo(projectRef);
    await newBotProject.index();
    const project: { [key: string]: any } = await newBotProject.getIndexes();
    expect(project.dialogs.length).toBe(3);
  });
});
