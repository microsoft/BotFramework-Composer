import fs from 'fs';

import { Path } from '../../../src/utility/path';
import { BotProject } from '../../../src/models/bot/botProject';
import { LocationRef, FileInfo } from '../../../src/models/bot/interface';

import DIALOG_TEMPLATE from './../../../src/store/dialogTemplate.json';

jest.mock('azure-storage', () => {
  return {};
});

const botDir = '../../mocks/samplebots/bot1';

const mockLocationRef: LocationRef = {
  storageId: 'default',
  path: Path.join(__dirname, `${botDir}`),
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
    expect(project.luFiles.length).toBe(3);

    // find out lg templates used in
    expect(project.dialogs.find((d: { isRoot: boolean }) => d.isRoot).lgTemplates.length).toBe(3);
    expect(project.dialogs.find((d: { isRoot: boolean }) => d.isRoot).lgTemplates.join(',')).toBe(
      ['hello', 'bye', 'ShowImage'].join(',')
    );

    // find out dialog used in,
    // here main.dialog refers a.dialog
    expect(project.dialogs.find((d: { isRoot: boolean }) => d.isRoot).referredDialogs.length).toBe(1);
    expect(project.dialogs.find((d: { isRoot: boolean }) => d.isRoot).referredDialogs.join(',')).toBe(['a'].join(','));
  });
});

describe('updateDialog', () => {
  it('should update a file at a path', async () => {
    const initValue = { old: 'value' };
    const newValue = { new: 'value' };
    const dialogs = await proj.updateDialog('a', newValue);
    const aDialog = dialogs.find((f: { id: string }) => f.id === 'a');
    // @ts-ignore
    expect(aDialog.content).toEqual(newValue);
    await proj.updateDialog('a', initValue);
  });
});

describe('createFromTemplate', () => {
  const dialogName = 'MyTestDialog';
  const content = JSON.stringify(DIALOG_TEMPLATE, null, 2) + '\n';

  afterEach(() => {
    try {
      fs.unlinkSync(Path.resolve(__dirname, `${botDir}/${dialogName}.dialog`));
    } catch (err) {
      throw new Error(err);
    }
  });

  it('should create a dialog file with given steps', async () => {
    const dialogs = await proj.createDialog(dialogName, content);
    const newFile = dialogs.find((f: { id: string }) => f.id === dialogName);

    expect(newFile).not.toBeUndefined();
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
      const deleteFolder = (path: string): void => {
        let files = [];
        if (fs.existsSync(path)) {
          files = fs.readdirSync(path);
          files.forEach(function(file) {
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

describe('modify non exist files', () => {
  it('should throw error on delete/update non-exist lu/lg files', async () => {
    const id = 'non-exist-file';
    const content = 'blabla';
    await expect(proj.removeLgFile(id)).rejects.toThrow();
    await expect(proj.removeLuFile(id)).rejects.toThrow();
    await expect(proj.updateLgFile(id, content)).rejects.toThrow();
    await expect(proj.updateLuFile(id, content)).rejects.toThrow();
  });
});

describe('lg operation', () => {
  afterAll(() => {
    try {
      fs.rmdirSync(Path.resolve(__dirname, `${botDir}/root`));
    } catch (err) {
      throw new Error(err);
    }
  });

  it('should create lg file and update index', async () => {
    const id = 'root';
    const dir = 'root';
    const content = '# hello \n - hello';
    const lgFiles = await proj.createLgFile(id, content, dir);
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(8);
    expect(lgFiles.length).toEqual(2);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lg');
      expect(result.content).toEqual(content);
    }
  });

  it('should update lg file and update index', async () => {
    const id = 'root';
    const content = '# hello \n - hello2';
    const lgFiles = await proj.updateLgFile(id, content);
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(8);
    expect(lgFiles.length).toEqual(2);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lg');
      expect(result.content).toEqual(content);
    }
  });

  it('should throw error when lg content is invalid', async () => {
    const id = 'root';
    const content = '# hello \n hello3';

    await expect(proj.updateLgFile(id, content)).rejects.toThrow();
  });

  it('should delete lg file and update index', async () => {
    const id = 'root';
    const lgFiles = await proj.removeLgFile(id);
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(7);
    expect(lgFiles.length).toEqual(1);

    expect(result).toBeUndefined();
  });
});

describe('lu operation', () => {
  afterAll(() => {
    try {
      fs.rmdirSync(Path.resolve(__dirname, `${botDir}/root`));
    } catch (err) {
      throw new Error(err);
    }
  });

  it('should create lu file and update index', async () => {
    const id = 'root';
    const dir = 'root';
    const content = '## hello \n - hello';
    const luFiles = await proj.createLuFile(id, content, dir);
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(8);
    expect(luFiles.length).toEqual(4);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lu');
      expect(result.content).toEqual(content);
    }
  });

  it('should update lu file and update index', async () => {
    const id = 'root';
    const content = '## hello \n - hello2';
    const luFiles = await proj.updateLuFile(id, content);
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(8);
    expect(luFiles.length).toEqual(4);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lu');
      expect(result.content).toEqual(content);
    }
  });

  it('should throw error when lu content is invalid', async () => {
    const id = 'root';
    const content = 'hello \n hello3';

    await expect(proj.updateLuFile(id, content)).rejects.toThrow();
  });

  it('should delete lu file and update index', async () => {
    const id = 'root';
    const luFiles = await proj.removeLuFile(id);
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(7);
    expect(luFiles.length).toEqual(3);

    expect(result).toBeUndefined();
  });
});
