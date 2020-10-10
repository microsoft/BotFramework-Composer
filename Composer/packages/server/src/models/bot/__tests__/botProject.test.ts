// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import rimraf from 'rimraf';
import { DialogFactory, SDKKinds } from '@bfc/shared';
import endsWith from 'lodash/endsWith';

import { Path } from '../../../utility/path';
import { BotProject } from '../botProject';
import { LocationRef } from '../interface';

jest.mock('azure-storage', () => {
  return {};
});

jest.mock('../../../services/asset', () => {
  return {
    manager: {
      botProjectFileTemplate: {
        $schema: '',
        name: '',
        workspace: '',
        skills: {},
      },
    },
  };
});

const botDir = '../../../__mocks__/samplebots/bot1';

const mockLocationRef: LocationRef = {
  storageId: 'default',
  path: Path.join(__dirname, `${botDir}`),
};
let proj: BotProject;

beforeEach(async () => {
  proj = new BotProject(mockLocationRef);
  await proj.init();
});

describe('init', () => {
  it('should get project successfully', () => {
    const project: { [key: string]: any } = proj.getProject();
    expect(project.files.length).toBe(15);
  });

  it('should always have a default bot project file', () => {
    const project: { [key: string]: any } = proj.getProject();
    const botprojectFile = project.files.find((file) => endsWith(file.name, 'botproj'));
    expect(botprojectFile).toBeDefined();
  });
});

describe('updateDialog', () => {
  it('should update a file at a path', async () => {
    const initValue = JSON.stringify({ old: 'value' });
    const newValue = JSON.stringify({ new: 'value' });
    await proj.updateFile('a.dialog', newValue);
    const aDialog = proj.getFile('a.dialog');
    expect(aDialog?.content).toEqual(newValue);
    await proj.updateFile('a.dialog', initValue);
  });
});

describe('createFromTemplate', () => {
  const dialogName = 'mytestdialog';
  const content = JSON.stringify(new DialogFactory({}).create(SDKKinds.AdaptiveDialog), null, 2) + '\n';

  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/dialogs/${dialogName}`));
    } catch (err) {
      // ignore
    }
  });

  it('should create a dialog file with given steps', async () => {
    const file = await proj.createFile(`${dialogName}.dialog`, content);

    expect(file).not.toBeUndefined();
    const fileContent = JSON.parse(file.content);
    expect(fileContent.$kind).toEqual(SDKKinds.AdaptiveDialog);
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
          files.forEach((file) => {
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
    await newBotProject.init();
    const project: { [key: string]: any } = newBotProject.getProject();
    expect(project.files.length).toBe(15);
  });
});

describe('modify non exist files', () => {
  it('should throw error on delete/update non-exist lu/lg files', async () => {
    const id = 'non-exist-file';
    const content = 'blabla';
    await expect(proj.deleteFile(id)).rejects.toThrow();
    await expect(proj.deleteFile(id)).rejects.toThrow();
    await expect(proj.updateFile(id, content)).rejects.toThrow();
    await expect(proj.updateFile(id, content)).rejects.toThrow();
  });
});

describe('lg operations', () => {
  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/dialogs/root`));
    } catch (err) {
      // ignore
    }
  });

  it('should create lg file and update index', async () => {
    await proj.init();
    const lgFilesCount = proj.lgFiles.length;
    const id = 'root.lg';
    const content = '# hello \n - hello';
    const file = await proj.createFile(id, content);

    expect(proj.lgFiles).toHaveLength(lgFilesCount + 1);

    expect(file).not.toBeUndefined();
    if (file !== undefined) {
      expect(file.content).toContain(content);
    }
  });

  it('should update lg file and update index', async () => {
    await proj.init();
    const lgFilesCount = proj.lgFiles.length;

    const id = 'root.en-us.lg';
    let content = '# hello \n - hello';
    await proj.createFile(id, content);

    content = '# hello \n - hello2';
    await proj.updateFile(id, content);
    const result = proj.getFile(id);

    expect(proj.lgFiles).toHaveLength(lgFilesCount + 1);

    expect(result).not.toBeUndefined();
    if (result !== undefined) {
      expect(result.content).toContain(content);
    }
  });

  it('should delete lg file and update index', async () => {
    const id = 'root.en-us.lg';
    const content = '# hello \n - hello';
    await proj.createFile(id, content);

    const lgFilesCount = proj.lgFiles.length;

    await proj.deleteFile(id);
    expect(proj.lgFiles).toHaveLength(lgFilesCount - 1);
    expect(proj.getFile(id)).toBeUndefined();
  });
});

describe('lu operations', () => {
  afterEach(() => {
    try {
      rimraf.sync(Path.resolve(__dirname, `${botDir}/dialogs/root`));
      rimraf.sync(Path.resolve(__dirname, `${botDir}/generated`));
    } catch (err) {
      // ignore
    }
  });

  it('should create lu file and update index', async () => {
    await proj.init();
    const luFilesCount = proj.luFiles.length;

    const id = 'root.en-us.lu';
    const content = '# hello \n - hello';
    const file = await proj.createFile(id, content);

    expect(proj.luFiles).toHaveLength(luFilesCount + 1);

    expect(file).not.toBeUndefined();
    if (file !== undefined) {
      expect(file.content).toContain(content);
    }
  });

  it('should update lu file and update index', async () => {
    await proj.init();
    const luFilesCount = proj.luFiles.length;

    const id = 'root.en-us.lu';
    let content = '## hello \n - hello';
    await proj.createFile(id, content);
    content = '## hello \n - hello2';

    await proj.updateFile(id, content);
    const result = proj.getFile(id);

    expect(proj.luFiles).toHaveLength(luFilesCount + 1);

    expect(result).toBeDefined();
    expect(result?.content).toContain(content);
  });

  it('should delete lu file and update index', async () => {
    const id = 'root.en-us.lu';
    const content = '## hello \n - hello2';
    await proj.createFile(id, content);
    const luFilesCount = proj.luFiles.length;

    await proj.deleteFile(id);
    const result = proj.getFile(id);

    expect(proj.luFiles.length).toEqual(luFilesCount - 1);
    expect(result).toBeUndefined();
  });
});

describe('qna operations', () => {
  it('should get qna endpoint key', async () => {
    await proj.init();
    const subscriptionKey = '21640b8e2110449abfdfccf2f6bbee02';
    const endpointKey = await proj.updateQnaEndpointKey(subscriptionKey);
    expect(endpointKey).toBe('d423d198-b0cc-46b3-a48c-e32d7a7e5b8a');
  });
});
describe('buildFiles', () => {
  const path = Path.resolve(__dirname, `${botDir}/generated`);
  afterEach(() => {
    try {
      rimraf.sync(path);
    } catch (err) {
      // ignore
    }
  });
  it('should build lu & qna file successfully', async () => {
    proj.init();
    const luisConfig = {
      authoringEndpoint: '',
      authoringKey: '412f0bfc19824ceca7a6076d05478850',
      authoringRegion: 'westus',
      defaultLanguage: 'en-us',
      endpoint: '',
      endpointKey: '',
      environment: 'composer',
      name: 'alan-qna',
    };
    const qnaConfig = {
      endpointKey: '',
      qnaRegion: 'westus',
      subscriptionKey: '21640b8e2110449abfdfccf2f6bbee02',
    };
    const luFileIds = ['a.en-us', 'b.en-us', 'bot1.en-us'];
    const qnaFileIds = ['a.en-us', 'b.en-us', 'bot1.en-us'];
    const crossTrainConfig = {
      botName: 'bot1',
      rootIds: [],
      triggerRules: {},
      intentName: '_Interruption',
      verbose: true,
    };
    await proj.buildFiles({ luisConfig, qnaConfig, luFileIds, qnaFileIds, crossTrainConfig });

    try {
      if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        expect(files).toContain('a.lu.qna.dialog');
      }
    } catch (err) {
      // ignore
    }
  }, 30000);
});

describe('dialog operations', () => {
  it('should create dialog', async () => {
    const dialogsFilesCount = proj.dialogFiles.length;

    const id = 'root.dialog';
    const content = '{}';
    await proj.createFile(id, content);

    expect(proj.dialogFiles).toHaveLength(dialogsFilesCount + 1);
  });

  it('should delete dialog', async () => {
    const id = 'root.dialog';
    const dialogsFilesCount = proj.dialogFiles.length;

    await proj.deleteFile(id);

    expect(proj.dialogFiles).toHaveLength(dialogsFilesCount - 1);
  });
});

describe('dialog schema operations', () => {
  it('should create dialog schema', async () => {
    const dialogsSchemaFilesCount = proj.dialogSchemaFiles.length;

    const id = 'bot1.dialog.schema';
    const content = '{}';
    const { relativePath } = await proj.createFile(id, content);

    expect(relativePath).toEqual(id);
    expect(proj.dialogSchemaFiles).toHaveLength(dialogsSchemaFilesCount + 1);
  });

  it('should delete dialog schema', async () => {
    const id = 'bot1.dialog.schema';
    const dialogsSchemaFilesCount = proj.dialogSchemaFiles.length;

    await proj.deleteFile(id);

    expect(proj.dialogSchemaFiles).toHaveLength(dialogsSchemaFilesCount - 1);
  });
});

describe('should validate the file name when create a new one', () => {
  it('validate the empty dialog name', () => {
    expect(() => {
      proj.validateFileName('.dialog');
    }).toThrowError('The file name can not be empty');
  });

  it('validate the illegal dialog name', async () => {
    expect(() => {
      proj.validateFileName('a.b.dialog');
    }).toThrowError('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  });

  it('validate the empty lu file name', () => {
    expect(() => {
      proj.validateFileName('.en-us.lu');
    }).toThrowError('The file name can not be empty');
  });

  it('validate the illegal lu file name', async () => {
    expect(() => {
      proj.validateFileName('a.b.en-us.lu');
    }).toThrowError('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  });

  it('validate the empty lg file name', () => {
    expect(() => {
      proj.validateFileName('.en-us.lg');
    }).toThrowError('The file name can not be empty');
  });

  it('validate the illegal lu file name', async () => {
    expect(() => {
      proj.validateFileName('a.b.en-us.lg');
    }).toThrowError('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  });
});

describe('deleteAllFiles', () => {
  const locationRef: LocationRef = {
    storageId: 'default',
    path: copyDir,
  };

  it('should copy and then delete successfully', async () => {
    const newBotProject = await proj.copyTo(locationRef);
    await newBotProject.init();
    const project: { [key: string]: any } = newBotProject.getProject();
    expect(project.files.length).toBe(15);
    await newBotProject.deleteAllFiles();
    expect(fs.existsSync(copyDir)).toBe(false);
  });
});
