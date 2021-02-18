// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request } from 'express';
import rimraf from 'rimraf';
import * as msRest from '@azure/ms-rest-js';

import { ExtensionContext } from '../../models/extension/extensionContext';
import { BotProjectService } from '../../services/project';
import AssetService from '../../services/asset';
import { ProjectController } from '../../controllers/project';
import { Path } from '../../utility/path';

jest.mock('../../models/extension/extensionContext', () => {
  return {
    ExtensionContext: {
      extensions: {
        botTemplates: [],
        baseTemplates: [],
        publish: [],
      },
      getUserFromRequest: jest.fn(),
    },
  };
});

const mockSendRequest = jest.fn();
msRest.ServiceClient.prototype.sendRequest = mockSendRequest;

const mockSampleBotPath = Path.join(__dirname, '../../__mocks__/asset/projects/SampleBot');

let mockRes: any;

const newBot = Path.resolve(__dirname, '../../__mocks__/samplebots/newBot');
const saveAsDir = Path.resolve(__dirname, '../../__mocks__/samplebots/saveAsBot');
const useFortest = Path.resolve(__dirname, '../../__mocks__/samplebots/test');
const bot1 = Path.resolve(__dirname, '../../__mocks__/samplebots/bot1');

const location1 = {
  storageId: 'default',
  path: bot1,
};

const location2 = {
  storageId: 'default',
  path: useFortest,
};

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  };
  mockRes.status.mockClear();
  mockRes.json.mockClear();
  mockRes.send.mockClear();
  mockRes.sendStatus.mockClear();
});

beforeAll(async () => {
  ExtensionContext.extensions.botTemplates.push({
    id: 'SampleBot',
    name: 'Sample Bot',
    description: 'Sample Bot',
    path: mockSampleBotPath,
  });
  const currentProjectId = await BotProjectService.openProject(location1);
  const currentProject = await BotProjectService.getProjectById(currentProjectId);
  await BotProjectService.saveProjectAs(currentProject, location2);
});

afterAll(() => {
  // remove the new bot files
  try {
    rimraf.sync(newBot);
    rimraf.sync(saveAsDir);
    rimraf.sync(useFortest);
  } catch (error) {
    throw new Error(error);
  }
});

describe('get bot project', () => {
  it('should get no project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await ProjectController.getProjectById(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'project undefined not found in cache',
    });
  });

  it('should get current project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../../__mocks__/samplebots/bot1') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('get all projects', () => {
  it('should get all project', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../../__mocks__/samplebots') },
    } as Request;
    await ProjectController.getAllProjects(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('open bot operation', () => {
  it('should fail to open an unexisting bot', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: 'wrong/path' },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'file wrong/path does not exist',
    });
  });

  it('should open bot1', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', path: Path.resolve(__dirname, '../../__mocks__/samplebots/bot1') },
    } as Request;
    await ProjectController.openProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('should save as bot', () => {
  const saveAsDir = Path.resolve(__dirname, '../../__mocks__/samplebots/');
  it('saveProjectAs', async () => {
    const projectId = await BotProjectService.openProject(location1);
    const schemaUrl = 'http://json-schema.org/draft-07/schema#';
    const mockReq = {
      params: { projectId },
      query: {},
      body: { storageId: 'default', location: saveAsDir, description: '', name: 'saveAsBot', schemaUrl },
    } as Request;
    await ProjectController.saveProjectAs(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    // remove the saveas files
  });
});

describe('should get recent projects', () => {
  it('should get recent projects', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;
    await ProjectController.getRecentProjects(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('create a component model conversational core bot project', () => {
  const newBotDir = Path.resolve(__dirname, '../../__mocks__/samplebots/');
  const name = 'newConversationalCoreBot';
  const mockReq = {
    params: {},
    query: {},
    body: {
      storageId: 'default',
      location: newBotDir,
      description: '',
      name: name,
      templateId: 'generator-conversational-core',
      templateVersion: '1.0.9',
    },
  } as Request;

  jest.mock('yeoman-environment', () => ({
    installLocalGenerators: jest.fn(() => {
      console.log('in mock install local generators');
    }),
    lookupLocalPackages: jest.fn(() => {
      console.log('in mock lookupLocalPackages');
    }),
    createEnv: jest.fn().mockImplementation(() => {
      console.log('in mock create env');
      return {
        lookupLocalPackages: jest.fn(),
      };
    }),
  }));

  it('should start to create a new project', async () => {
    BotProjectService.createProjectAsync = jest.fn();

    ProjectController.createProjectV2(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(202);
  });
});

describe('create a Empty Bot project', () => {
  it('should create a new project', async () => {
    const newBotDir = Path.resolve(__dirname, '../../__mocks__/samplebots/');
    const name = 'newBot';
    const mockReq = {
      params: {},
      query: {},
      body: { storageId: 'default', location: newBotDir, description: '', name: name, templateId: 'SampleBot' },
    } as Request;
    await ProjectController.createProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
//current opened bot is the newBot
describe('dialog operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });
  it('should update dialog', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'bot1.dialog', content: JSON.stringify({ $kind: 'aaa' }) },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
  it('should create dialog', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog', content: JSON.stringify({ $kind: 'aaa' }) },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog', async () => {
    const mockReq = {
      params: { name: 'test2.dialog', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

//current opened bot is the newBot
describe('dialog schema operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should create dialog schema', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog.schema', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should update dialog schema', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test2.dialog.schema', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove dialog schema', async () => {
    const mockReq = {
      params: { name: 'test2.dialog.schema', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lg operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should update lg file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'common.en-us.lg', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lg file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'test1.en-us.lg', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lg file', async () => {
    const mockReq = {
      params: { name: 'test1.en-us.lg', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('lu operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should update lu file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'b.en-us.lu', content: '' },
    } as Request;
    await ProjectController.updateFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should create lu file', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: { name: 'c.en-us.lu', content: '' },
    } as Request;
    await ProjectController.createFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should remove lu file', async () => {
    const mockReq = {
      params: { name: 'c.en-us.lu', projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeFile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('skill operation', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should retrieve skill manifest', async () => {
    mockSendRequest.mockResolvedValue({});
    const url = 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json';

    const mockReq = {
      params: { projectId },
      query: {
        url,
      },
      body: {},
    } as Request;
    await ProjectController.getSkill(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockSendRequest).toHaveBeenCalledWith({
      url,
      method: 'GET',
    });
  }, 10000);
});

// TODO: add a success publish test.
describe('publish luis files', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location1);
  });

  it('should publish all luis & qna files', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {
        authoringKey: '0d4991873f334685a9686d1b48e0ff48',
        projectId: projectId,
        crossTrainConfig: {},
        luFiles: [],
      },
      setTimeout: (msecs: number, callback: () => any): void => {},
    } as Request & { setTimeout };
    await ProjectController.build(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalled();
  });
});

describe('remove project', () => {
  let projectId = '';
  beforeEach(async () => {
    projectId = await BotProjectService.openProject(location2);
  });

  it('should remove current project', async () => {
    const mockReq = {
      params: { projectId },
      query: {},
      body: {},
    } as Request;
    await ProjectController.removeProject(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('getting a project by alias', () => {
  let getProjectByAliasBackup;
  beforeEach(() => {
    getProjectByAliasBackup = BotProjectService.getProjectByAlias;
  });

  afterEach(() => {
    BotProjectService.getProjectByAlias = getProjectByAliasBackup;
  });

  it('should get a project by its alias if it exists', async () => {
    const mockReq: any = {
      params: {
        alias: 'my-bot.alias',
      },
    };
    const mockBotProject = {
      id: 'botId',
      dir: '/path/to/bot',
      exists: jest.fn().mockResolvedValue(true),
      name: 'my-bot',
    };
    BotProjectService.getProjectByAlias = jest.fn().mockResolvedValueOnce(mockBotProject);
    await ProjectController.getProjectByAlias(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      location: mockBotProject.dir,
      id: mockBotProject.id,
      name: 'my-bot',
    });
  });

  it('should return a 404 if no matching project is found for the alias', async () => {
    const mockReq: any = {
      params: {
        alias: 'my-bot.non-existent-alias',
      },
    };
    BotProjectService.getProjectByAlias = jest.fn().mockResolvedValueOnce(undefined);
    await ProjectController.getProjectByAlias(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No matching bot project found for alias my-bot.non-existent-alias',
    });
  });

  it('should return a 400 if no alias is sent with the request', async () => {
    const mockReq: any = {
      params: {
        alias: undefined,
      },
    };
    await ProjectController.getProjectByAlias(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Parameters not provided, requires "alias" parameter',
    });
  });

  it('should return a 500 if an error is thrown', async () => {
    const mockReq: any = {
      params: {
        alias: 'my-bot.alias',
      },
    };
    const error = new Error('Something went wrong while getting the project by alias');
    BotProjectService.getProjectByAlias = jest.fn().mockRejectedValueOnce(error);
    await ProjectController.getProjectByAlias(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });
});

describe('Backing up a project', () => {
  let getProjectByIdBackup;
  let backupProjectBackup;
  beforeEach(() => {
    getProjectByIdBackup = BotProjectService.getProjectById;
    backupProjectBackup = BotProjectService.backupProject;
  });

  afterEach(() => {
    BotProjectService.getProjectById = getProjectByIdBackup;
    BotProjectService.backupProject = backupProjectBackup;
  });

  it('should backup a project', async () => {
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce({});
    BotProjectService.backupProject = jest.fn().mockResolvedValueOnce('/backup/path');
    const mockReq: any = {
      params: {
        projectId: 'projectId',
      },
    };
    await ProjectController.backupProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ path: '/backup/path' });
  });

  it('should return a 404 if it cannot find the specified project', async () => {
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce(undefined);
    const mockReq: any = {
      params: {
        projectId: 'projectId',
      },
    };
    await ProjectController.backupProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Could not find bot project with ID: projectId' });
  });

  it('should return a 500 if an error is thrown', async () => {
    const error = 'Something went wrong while backing up.';
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce({});
    BotProjectService.backupProject = jest.fn().mockRejectedValueOnce(new Error(error));
    const mockReq: any = {
      params: {
        projectId: 'projectId',
      },
    };
    await ProjectController.backupProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(new Error(error));
  });
});

describe('copying a template to an existing project', () => {
  let getProjectByIdBackup;
  let backupProjectBackup;
  let setProjectLocationDataBackup;
  let assetServiceManagerBackup;
  beforeEach(() => {
    getProjectByIdBackup = BotProjectService.getProjectById;
    backupProjectBackup = BotProjectService.backupProject;
    setProjectLocationDataBackup = BotProjectService.setProjectLocationData;
    assetServiceManagerBackup = { ...AssetService.manager };
  });

  afterEach(() => {
    BotProjectService.getProjectById = getProjectByIdBackup;
    BotProjectService.backupProject = backupProjectBackup;
    BotProjectService.setProjectLocationData = setProjectLocationDataBackup;
    AssetService.manager = assetServiceManagerBackup;
  });

  it('should copy a template to an existing project', async () => {
    const mockReq: any = {
      body: {
        eTag: 'someEtag',
        templateDir: '/template/dir',
      },
      params: {
        projectId: 'projectId',
      },
    };
    const mockBotProject = {
      fileStorage: {
        rmrfDir: jest.fn().mockResolvedValue(undefined),
      },
    };
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce(mockBotProject);
    BotProjectService.setProjectLocationData = jest.fn().mockReturnValue(undefined);
    (AssetService.manager as any) = {
      copyRemoteProjectTemplateTo: jest.fn().mockResolvedValue(undefined),
    };
    await ProjectController.copyTemplateToExistingProject(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should return a 400 if templateDir parameter is missing in request', async () => {
    const mockReq: any = {
      body: {
        eTag: 'someEtag',
        templateDir: undefined,
      },
      params: {
        projectId: 'projectId',
      },
    };
    await ProjectController.copyTemplateToExistingProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing parameters: templateDir required.' });
  });

  it('should return a 404 if no project is found with the specified id', async () => {
    const mockReq: any = {
      body: {
        eTag: 'someEtag',
        templateDir: '/template/dir',
      },
      params: {
        projectId: 'nonExistentProjectId',
      },
    };
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce(undefined);
    await ProjectController.copyTemplateToExistingProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Could not find bot project with ID: nonExistentProjectId' });
  });

  it('should return a 500 an error is thrown', async () => {
    const mockReq: any = {
      body: {
        eTag: 'someEtag',
        templateDir: '/template/dir',
      },
      params: {
        projectId: 'nonExistentProjectId',
      },
    };
    const error = new Error('Something went wrong while prepping for incoming template content.');
    const mockBotProject = {
      fileStorage: {
        rmrfDir: jest.fn().mockRejectedValue(error),
      },
    };
    BotProjectService.getProjectById = jest.fn().mockResolvedValueOnce(mockBotProject);
    await ProjectController.copyTemplateToExistingProject(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(error);
  });
});
