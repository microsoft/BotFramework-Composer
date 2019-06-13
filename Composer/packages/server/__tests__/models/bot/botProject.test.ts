import fs from 'fs';

import { Path } from '../../../src/utility/path';
import { BotProject } from '../../../src/models/bot/botProject';
import { LocationRef, FileInfo } from '../../../src/models/bot/interface';

jest.mock('azure-storage', () => {
  return {};
});

const botDir = '../../mocks/samplebots/bot1';

const mockLocationRef: LocationRef = {
  storageId: 'default',
  path: Path.join(__dirname, `${botDir}/1.botproj`),
};

const proj = new BotProject(mockLocationRef);

beforeEach(async () => {
  await proj.index();
});

describe('index', () => {
  it('should index successfully', async () => {
    const project: { [key: string]: any } = await proj.getIndexes();
    expect(project.dialogs.length).toBe(3);
    expect(project.lgFiles.length).toBe(1);
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
    const initValue = { services: [], entry: 'main.dialog' };
    const newValue = { services: ['test'], entry: 'main.dialog' };
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
      fs.unlinkSync(Path.resolve(__dirname, `${botDir}/${dialogName}.dialog`));
    } catch (err) {
      // ignore
    }
  });

  it('should create a dialog file with given steps', async () => {
    const dialogs = await proj.createDialogFromTemplate(dialogName);
    const newFile = dialogs.find((f: { name: string }) => f.name.startsWith(dialogName));

    if (!newFile) {
      expect(newFile).toBeTruthy();
    }

    const fileContent = ((newFile as unknown) as FileInfo).content;
    expect(fileContent.$type).toEqual('Microsoft.AdaptiveDialog');
  });
});

const copyDir = Path.join(__dirname, botDir, '../copy');

describe('copyTo', () => {
  const locationRef: LocationRef = {
    storageId: 'default',
    path: copyDir,
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

  it('should copy successfully', async () => {
    const newBotProject = await proj.copyTo(locationRef);
    await newBotProject.index();
    const project: { [key: string]: any } = await newBotProject.getIndexes();
    expect(project.dialogs.length).toBe(3);
  });
});

describe('update lg template', () => {
  it('should update the lg template.', async () => {
    const initValue = `# greet
    - Hello!`;

    const newValue = `# updated
    - Hi!`;

    const lgFiles = await proj.updateLgFile('test', newValue);
    const aFile = lgFiles.find(f => f.id === 'test');
    // @ts-ignore
    expect(aFile.content).toEqual(newValue);
    await proj.updateLgFile('test', initValue);
  });
});
