// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';
import fs from 'fs-extra';
import { DialogFactory, SDKKinds } from '@bfc/shared';
import endsWith from 'lodash/endsWith';
import { nanoid } from 'nanoid';

import { Path } from '../../../utility/path';
import { BotProject } from '../botProject';
import { LocationRef } from '../interface';

import { Resource } from './../interface';

jest.mock('azure-storage', () => {
  return {};
});

jest.mock('../../../services/asset', () => {
  return {
    manager: {
      botProjectFileTemplate: {
        $schema: '',
        name: '',
        skills: {},
      },
    },
  };
});

jest.mock('../process/orchestratorBuilder', () => ({
  warmupCache: jest.fn(),
  build: jest.fn(),
}));

const newBotName = nanoid();
const botDir = Path.resolve(__dirname, `../../../__mocks__/samplebots/${newBotName}`);

const mockLocationRef: LocationRef = {
  storageId: 'default',
  path: botDir,
};
let proj: BotProject;

const cleanup = (dirs: string | string[]) => {
  const targets = Array.isArray(dirs) ? dirs : [dirs];

  for (const dir of targets) {
    try {
      rimraf.sync(dir);
    } catch {
      // ignore
    }
  }
};

beforeAll(async () => {
  // create a new bot just for these tests to avoid race conditions
  const sampleBotDir = '../../../__mocks__/samplebots/bot1';
  const sample = new BotProject({
    storageId: 'default',
    path: Path.join(__dirname, sampleBotDir),
  });
  await sample.copyTo(mockLocationRef);
});

afterAll(() => {
  cleanup(botDir);
});

beforeEach(async () => {
  proj = new BotProject(mockLocationRef);
  await proj.init();
});

describe('init', () => {
  it('should get project successfully', () => {
    const project: { [key: string]: any } = proj.getProject();
    expect(project.files.length).toBe(16);
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
    cleanup(Path.join(botDir, `/dialogs/${dialogName}`));
  });

  it('should create a dialog file with given steps', async () => {
    const file = await proj.createFile(`${dialogName}.dialog`, content);

    expect(file).not.toBeUndefined();
    const fileContent = JSON.parse(file.content);
    expect(fileContent.$kind).toEqual(SDKKinds.AdaptiveDialog);
  });
});

const copyDir = Path.join(botDir, '../copy');

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
          cleanup(path);
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
    expect(project.files.length).toBe(16);
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
    cleanup(Path.join(botDir, '/dialogs/root'));
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
    cleanup([Path.join(botDir, '/dialogs/root'), Path.join(botDir, '/generated')]);
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
    proj.builder.qnaBuilder.getEndpointKeys = jest.fn(() => ({ primaryEndpointKey: 'new key' }));
    const subscriptionKey = 'test';
    const endpointKey = await proj.updateQnaEndpointKey(subscriptionKey);
    expect(endpointKey).toBe('new key');
  });
});

describe('skill operations', () => {
  const url = 'https://xxx/manifests/Empty_45-2-1-manifest.json';
  const skillName = 'manifest';
  const zipContent = {
    'manifests/': '',
    'manifests/Empty-2-1-manifest.json':
      '{\n  "$schema": "https://schemas.botframework.com/schemas/skills/v2.1/skill-manifest.json",\n  "$id": "Empty-f49bb91b-8d8d-492a-adc5-dd6c599bbc7a",\n  "endpoints": [\n    {\n      "protocol": "BotFrameworkV3",\n      "name": "bb-0622",\n      "endpointUrl": "https://bb-0622.azurewebsites.net/api/messages",\n      "description": "<description>",\n      "msAppId": "56969972-de80-4fbc-ad8c-e0ccf1600d09"\n    }\n  ],\n  "name": "Empty",\n  "version": "abc",\n  "publisherName": "abc",\n  "activities": {\n    "Empty": {\n      "type": "event",\n      "name": "Empty"\n    },\n    "conversationUpdate": {\n      "type": "conversationUpdate"\n    },\n    "message": {\n      "type": "message"\n    }\n  },\n  "dispatchModels": {\n    "languages": {\n      "en-us": [\n        {\n          "name": "Empty",\n          "contentType": "application/lu",\n          "url": "./skill-Empty.en-us.lu",\n          "description": "<description>"\n        }\n      ]\n    },\n    "intents": [\n      "test"\n    ]\n  }\n}\n',
    'manifests/skill-Empty.en-us.lu':
      '# test\n> add some example phrases to trigger this intent:\n> - please tell me the weather\n> - what is the weather like in {city=Seattle}\n\n> entity definitions:\n> @ ml city\n-test',
  };

  afterEach(() => {
    cleanup(Path.join(botDir, '/skills'));
  });

  it('should create skill files', async () => {
    await proj.init();

    const file = await proj.createSkillFiles(url, skillName, zipContent);

    expect(file).not.toBeUndefined();
    expect(file?.content).toContain(zipContent['manifests/Empty-2-1-manifest.json']);
  });

  it('should delete skill files', async () => {
    await proj.createSkillFiles(url, skillName, zipContent);
    const fileLength = proj.luFiles.length;

    await proj.deleteSkillFiles(skillName);
    expect(proj.luFiles.length).toBeLessThanOrEqual(fileLength);
  });
});

describe('buildFiles', () => {
  it('should build lu & qna file successfully', async () => {
    await proj.init();
    const luisConfig = {
      authoringEndpoint: '',
      authoringKey: 'test',
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
      subscriptionKey: 'test',
    };
    const luResource: Resource[] = [
      { id: 'a.en-us', isEmpty: false },
      { id: 'b.en-us', isEmpty: false },
      { id: 'bot1.en-us', isEmpty: false },
    ];
    const qnaResource: Resource[] = [
      { id: 'a.en-us', isEmpty: false },
      { id: 'b.en-us', isEmpty: false },
      { id: 'bot1.en-us', isEmpty: false },
    ];
    proj.builder.luBuilder.build = jest.fn((items) => items.map((item) => item.id));
    proj.builder.luBuilder.writeDialogAssets = jest.fn();
    proj.builder.qnaBuilder.build = jest.fn((items) => items.map((item) => item.id));
    proj.builder.qnaBuilder.writeDialogAssets = jest.fn();
    await proj.buildFiles({ luisConfig, qnaConfig, luResource, qnaResource });
    expect(proj.builder.luBuilder.build).toHaveReturnedWith(['a', 'b', 'bot1']);
    expect(proj.builder.qnaBuilder.build).toHaveReturnedWith(['a', 'b', 'bot1']);
  });
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
  const error = new Error(
    'Spaces and special characters are not allowed. Use letters, numbers, -, or _, and begin the name with a letter.'
  );
  const emptyError = new Error('The file name can not be empty');

  it('validate the empty dialog name', () => {
    expect(() => {
      proj.validateFileName('.dialog');
    }).toThrowError(emptyError);
  });

  it('validate the illegal dialog name', async () => {
    expect(() => {
      proj.validateFileName('a.b.dialog');
    }).toThrowError(error);
  });

  it('validate the empty lu file name', () => {
    expect(() => {
      proj.validateFileName('.en-us.lu');
    }).toThrowError(emptyError);
  });

  it('validate the illegal lu file name', async () => {
    expect(() => {
      proj.validateFileName('a.b.en-us.lu');
    }).toThrowError(error);
  });

  it('validate the empty lg file name', () => {
    expect(() => {
      proj.validateFileName('.en-us.lg');
    }).toThrowError(emptyError);
  });

  it('validate the illegal lu file name', async () => {
    expect(() => {
      proj.validateFileName('a.b.en-us.lg');
    }).toThrowError(error);
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
    expect(project.files.length).toBe(16);
    await newBotProject.deleteAllFiles();
    expect(fs.existsSync(copyDir)).toBe(false);
  });
});
