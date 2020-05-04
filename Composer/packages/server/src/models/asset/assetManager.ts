// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import find from 'lodash/find';
import { ProjectTemplate } from '@bfc/shared';
import { UserIdentity } from '@bfc/plugin-loader';

import log from '../../logger';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';

interface TemplateData {
  [key: string]: {
    name: string;
    description: string;
    order?: number;
    icon?: string;
  };
}

const templates: TemplateData = {
  EchoBot: {
    name: 'Echo Bot',
    description: 'A bot that echoes and responds with whatever message the user entered',
    order: 1,
  },
  EmptyBot: {
    name: 'Empty Bot',
    description: 'Basic bot template that is ready for your creativity',
    order: 2,
  },
  TodoSample: {
    name: 'Simple Todo',
    description: 'A sample bot that allows you to add, list, and remove to do items.',
    order: 3,
  },
  ToDoBotWithLuisSample: {
    name: 'Todo with LUIS',
    description: 'A sample bot that allows you to add, list, and remove to do items using Language Understanding',
    order: 4,
  },
  RespondingWithCardsSample: {
    name: 'Responding with Cards',
    description: 'A sample bot that uses Language Generation to create cards.',
  },
  AskingQuestionsSample: {
    name: 'Asking Questions',
    description: 'A sample bot that shows how to ask questions and capture user input.',
  },
  InterruptionSample: {
    name: 'Interruptions',
    description:
      'An advanced sample bot that shows how to handle context switching and interruption in a conversation.',
  },
  RespondingWithTextSample: {
    name: 'Responding with Text',
    description: 'A sample bot that uses Language Generation to create bot responses.',
  },
  ControllingConversationFlowSample: {
    name: 'Controlling Conversation Flow',
    description: 'A sample bot that shows how to control the flow of a conversation.',
  },
  ActionsSample: {
    name: 'Dialog Actions',
    description: 'A sample bot that shows how to use Dialog Actions.',
  },
  QnAMakerLUISSample: {
    name: 'QnA Maker and LUIS',
    description: 'A sample bot that demonstrates use of both QnA Maker & LUIS',
  },
  SampleBot: {
    name: 'Sample Bot',
    description: 'A sample bot used for testing',
  },
};

const runtimes: TemplateData = {
  CSharp: {
    name: 'CSharp Runtime',
    description: 'A Bot Framework runtime using the CSharp/dotnet version of the SDK',
  },
};

// set a default runtime template.
// when we have multiple runtimes this will be a parameter.
const DEFAULT_RUNTIME = 'CSharp';

export class AssetManager {
  public templateStorage: LocalDiskStorage;
  private assetsLibraryPath: string;
  private runtimesPath: string;
  private projectTemplates: ProjectTemplate[] = [];
  private runtimeTemplates: ProjectTemplate[] = [];

  constructor(assetsLibraryPath: string, runtimesPath: string) {
    this.assetsLibraryPath = assetsLibraryPath;
    this.runtimesPath = runtimesPath;
    this.templateStorage = new LocalDiskStorage();

    // initialize the list of project tempaltes
    this.getProjectTemplates();

    // initialize the list of runtimes.
    this.getProjectRuntime();
  }

  public async getProjectTemplates(): Promise<ProjectTemplate[]> {
    const path = this.assetsLibraryPath + '/projects';
    const output: ProjectTemplate[] = [];
    if (await this.templateStorage.exists(path)) {
      const folders = await this.templateStorage.readDir(path);
      this.projectTemplates = [];
      for (const name of folders) {
        const templateData = templates[name];
        if (!templateData) continue;
        const absPath = Path.join(path, name);
        const folder = await this.templateStorage.stat(absPath);
        if (folder.isDir) {
          const base = { id: name, ...templateData };
          this.projectTemplates.push({ ...base, path: absPath });
          output.push(base);
        }
      }
    }

    return output.sort((a, b) => {
      if (a.order && b.order) {
        return a.order < b.order ? -1 : 1;
      } else if (a.order) {
        return -1;
      } else if (b.order) {
        return 1;
      } else {
        return a.name < b.name ? -1 : 1;
      }
    });
  }

  public async getProjectRuntime() {
    const path = this.runtimesPath;
    const output: ProjectTemplate[] = [];

    if (await this.templateStorage.exists(path)) {
      const folders = await this.templateStorage.readDir(path);
      this.runtimeTemplates = [];
      for (const name of folders) {
        const absPath = Path.join(path, name);
        if ((await this.templateStorage.stat(absPath)).isDir) {
          const base = { id: name, name: runtimes[name].name, description: runtimes[name].description };
          this.runtimeTemplates.push({ ...base, path: absPath });
          output.push(base);
        }
      }
    }

    return output;
  }

  // Copy material from the boilerplate into the project
  // This is used to copy shared content into every new project
  public async copyBoilerplate(dstDir: string, dstStorage: IFileStorage) {
    const boilerplatePath = Path.join(this.assetsLibraryPath, 'shared');
    if (await this.templateStorage.exists(boilerplatePath)) {
      await copyDir(boilerplatePath, this.templateStorage, dstDir, dstStorage);
    }
  }

  public async copyDataFilesTo(templateId: string, dstDir: string, dstStorage: IFileStorage) {
    const template = find(this.projectTemplates, { id: templateId });
    if (template === undefined || template.path === undefined) {
      throw new Error(`no such template with id ${templateId}`);
    }
    // copy Composer data files
    await copyDir(template.path, this.templateStorage, dstDir, dstStorage);
  }

  public async copyRuntimeTo(dstDir: string, dstStorage: IFileStorage) {
    const runtime = find(this.runtimeTemplates, { id: DEFAULT_RUNTIME });
    if (runtime === undefined || runtime.path === undefined) {
      throw new Error(`no such runtime with id ${DEFAULT_RUNTIME}`);
    }
    // copy runtime code files
    await copyDir(runtime.path, this.templateStorage, dstDir, dstStorage);
  }

  public async copyProjectTemplateTo(templateId: string, ref: LocationRef, user?: UserIdentity): Promise<LocationRef> {
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId, user);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      log('Failed copying template to %s', dstDir);
      throw new Error('already have this folder, please give another name');
    }
    await this.copyDataFilesTo(templateId, dstDir, dstStorage);
    // await this.copyRuntimeTo(dstDir, dstStorage);
    return ref;
  }
}
