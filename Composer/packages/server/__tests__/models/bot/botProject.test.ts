// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import rimraf from 'rimraf';
import { seedNewDialog, DialogInfo } from '@bfc/shared';

import { Path } from '../../../src/utility/path';
import { BotProject } from '../../../src/models/bot/botProject';
import { LocationRef } from '../../../src/models/bot/interface';

jest.mock('azure-storage', () => {
  return {};
});

const botDir = '../../mocks/samplebots/bot1';

const mockLocationRef: LocationRef = {
  storageId: 'default',
  path: Path.join(__dirname, `${botDir}`),
};

let proj: BotProject;

beforeEach(async () => {
  proj = new BotProject(mockLocationRef);
  await proj.index();
});

describe('index', () => {
  it('should index successfully', () => {
    const project: { [key: string]: any } = proj.getIndexes();
    expect(project.dialogs.length).toBe(3);
    expect(project.lgFiles.length).toBe(4);
    expect(project.luFiles.length).toBe(3);

    // find out lg templates used in
    expect(project.dialogs.find((d: { isRoot: boolean }) => d.isRoot).lgTemplates.length).toBe(3);
    expect(
      project.dialogs
        .find((d: { isRoot: boolean }) => d.isRoot)
        .lgTemplates.map(t => t.name)
        .join(',')
    ).toBe(['hello', 'bye', 'ShowImage'].join(','));

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
    await proj.updateDialog('a', newValue);
    const dialogs = proj.dialogs;
    const aDialog = dialogs.find((f: { id: string }) => f.id === 'a');
    // @ts-ignore
    expect(aDialog.content).toEqual(newValue);
    await proj.updateDialog('a', initValue);
  });
});

describe('createFromTemplate', () => {
  const dialogName = 'MyTestDialog';
  const content = JSON.stringify(seedNewDialog('Microsoft.AdaptiveDialog'), null, 2) + '\n';

  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/${dialogName}`));
    } catch (err) {
      // ignore
    }
  });

  it('should create a dialog file with given steps', async () => {
    const { dialogs } = await proj.createDialog(dialogName, content);
    const newFile = dialogs.find((f: { id: string }) => f.id === dialogName);

    expect(newFile).not.toBeUndefined();
    const fileContent = ((newFile as unknown) as DialogInfo).content;
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
        let files: string[] = [];
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
          rimraf.sync(path);
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
    const project: { [key: string]: any } = newBotProject.getIndexes();
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

describe('lg operations', () => {
  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/root`));
    } catch (err) {
      // ignore
    }
  });

  it('should create lg file and update index', async () => {
    await proj.index();
    const filesCount = proj.files.length;
    const lgFilesCount = proj.lgFiles.length;
    const id = 'root';
    const content = '# hello \n - hello';
    const lgFiles = await proj.createLgFile(id, content);
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount + 1);
    expect(lgFiles.length).toEqual(lgFilesCount + 1);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lg');
      expect(result.content).toContain(content);
    }
  });

  it('should update lg file and update index', async () => {
    await proj.index();
    const filesCount = proj.files.length;
    const lgFilesCount = proj.lgFiles.length;

    const id = 'root';
    let content = '# hello \n - hello';
    await proj.createLgFile(id, content);

    content = '# hello \n - hello2';
    await proj.updateLgFile(id, content);
    const lgFiles = proj.lgFiles;
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount + 1);
    expect(lgFiles.length).toEqual(lgFilesCount + 1);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lg');
      expect(result.content).toContain(content);
    }
  });

  it('should delete lg file and update index', async () => {
    const id = 'root';
    const content = '# hello \n - hello';
    await proj.createLgFile(id, content);

    const filesCount = proj.files.length;
    const lgFilesCount = proj.lgFiles.length;

    const lgFiles = await proj.removeLgFile(id);
    const result = lgFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount - 1);
    expect(lgFiles.length).toEqual(lgFilesCount - 1);

    expect(result).toBeUndefined();
  });
});

describe('lu operations', () => {
  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/root`));
      rimraf.sync(Path.resolve(__dirname, `${botDir}/generated`));
    } catch (err) {
      // ignore
    }
  });

  it('should create lu file and update index', async () => {
    await proj.index();
    const filesCount = proj.files.length;
    const luFilesCount = proj.luFiles.length;

    const id = 'root';
    const content = '# hello \n - hello';
    const luFiles = await proj.createLuFile(id, content);
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount + 1);
    expect(luFiles.length).toEqual(luFilesCount + 1);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.relativePath).toEqual('root/root.lu');
      expect(result.content).toContain(content);
    }
  });

  it('should update lu file and update index', async () => {
    await proj.index();
    const filesCount = proj.files.length;
    const luFilesCount = proj.luFiles.length;

    const id = 'root';
    let content = '## hello \n - hello';
    await proj.createLuFile(id, content);
    content = '## hello \n - hello2';

    await proj.updateLuFile(id, content);
    const luFiles = proj.luFiles;
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount + 1);
    expect(luFiles.length).toEqual(luFilesCount + 1);

    expect(result).not.toBeUndefined();
    expect(result?.relativePath).toEqual('root/root.lu');
    expect(result?.content).toContain(content);
  });

  it('should update diagnostics when lu content is invalid', async () => {
    const id = 'root';
    let content = '## hello \n - hello';
    await proj.createLuFile(id, content);

    content = 'hello \n hello3';

    await proj.updateLuFile(id, content);
    const luFiles = proj.luFiles;
    const result = luFiles.find(f => f.id === id);
    expect(result?.diagnostics?.length).toBeGreaterThan(0);
  });

  it('should delete lu file and update index', async () => {
    const id = 'root';
    const content = '## hello \n - hello2';
    await proj.createLuFile(id, content);
    const filesCount = proj.files.length;
    const luFilesCount = proj.luFiles.length;

    const luFiles = await proj.removeLuFile(id);
    const result = luFiles.find(f => f.id === id);

    expect(proj.files.length).toEqual(filesCount - 1);
    expect(luFiles.length).toEqual(luFilesCount - 1);

    expect(result).toBeUndefined();
  });
});

describe('dialog operations', () => {
  it('should create dialog and related lg lu file', async () => {
    const filesCount = proj.files.length;
    const dialogsFilesCount = proj.dialogs.length;
    const lgFilesCount = proj.lgFiles.length;
    const luFilesCount = proj.luFiles.length;

    const id = 'root';
    const content = '{}';
    const { dialogs, lgFiles, luFiles } = await proj.createDialog(id, content);

    expect(proj.files.length).toEqual(filesCount + 3);
    expect(dialogs.length).toEqual(dialogsFilesCount + 1);
    expect(lgFiles.length).toEqual(lgFilesCount + 1);
    expect(luFiles.length).toEqual(luFilesCount + 1);
  });

  it('should delete dialog and related lg lu file', async () => {
    const id = 'root';
    const filesCount = proj.files.length;
    const dialogsFilesCount = proj.dialogs.length;
    const lgFilesCount = proj.lgFiles.length;
    const luFilesCount = proj.luFiles.length;

    const { dialogs, lgFiles, luFiles } = await proj.removeDialog(id);

    expect(proj.files.length).toEqual(filesCount - 3);
    expect(dialogs.length).toEqual(dialogsFilesCount - 1);
    expect(lgFiles.length).toEqual(lgFilesCount - 1);
    expect(luFiles.length).toEqual(luFilesCount - 1);
  });
});
