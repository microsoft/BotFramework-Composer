import find from 'lodash.find';

import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';

import { IProjectTemplate } from './interface';

interface TemplateData {
  [key: string]: {
    name: string;
    description: string;
  };
}
const templates: TemplateData = {
  EchoBot: {
    name: 'Echo Bot',
    description: 'A bot that echoes and responds with whatever message the user entered',
  },
  EmptyBot: {
    name: 'Empty Bot',
    description: 'The very basic bot template that is ready for your creativity',
  },
  RespondingWithCardsSample: {
    name: 'Responding-with-Cards-Sample',
    description: 'A sample bot that uses Language Generation to create cards.',
  },
  AskingQuestionsSample: {
    name: 'Asking-Questions-Sample',
    description: 'A sample bot that shows how to ask question and capture user input.',
  },
  InterruptionSample: {
    name: 'Interruption-Sample',
    description: 'An advance sample bot that shows how to handle context switching and interruption in a conversation.',
  },
  RespondingWithTextSample: {
    name: 'Responding-with-Text-Sample',
    description: 'A sample bot that uses Language Generation to create bot responses.',
  },
  ControllingConversationFlowSample: {
    name: 'Controlling-Conversation-Flow-Sample',
    description: 'A sample bot that shows how to control the flow of a conversation.',
  },
  ActionsSample: {
    name: 'Actions-Sample',
    description: 'A sample bot that shows how to use Dialog actions.',
  },
  TodoSample: {
    name: 'Todo-Sample',
    description: 'A sample bot that allows you add, list, remove to do items.',
  },
  ToDoBotWithLuisSample: {
    name: 'Todo-with-LUIS-Sample',
    description: 'A sample bot that allows you add, list, remove to do items and uses language Understanding',
  },
  SampleBot: {
    name: 'SampleBot',
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
  private projectTemplates: IProjectTemplate[] = [];
  private runtimeTemplates: IProjectTemplate[] = [];

  constructor(assetsLibraryPath: string, runtimesPath: string) {
    this.assetsLibraryPath = assetsLibraryPath;
    this.runtimesPath = runtimesPath;
    this.templateStorage = new LocalDiskStorage();

    // initialize the list of project tempaltes
    this.getProjectTemplate();

    // initialize the list of runtimes.
    this.getProjectRuntime();
  }

  public async getProjectTemplate() {
    const path = this.assetsLibraryPath + '/projects';
    const output = [];

    if (await this.templateStorage.exists(path)) {
      const folders = await this.templateStorage.readDir(path);
      this.projectTemplates = [];
      for (const name of folders) {
        if (!templates[name]) continue;
        const absPath = Path.join(path, name);
        if ((await this.templateStorage.stat(absPath)).isDir) {
          const base = { id: name, name: templates[name].name, description: templates[name].description };
          this.projectTemplates.push({ ...base, path: absPath });
          output.push(base);
        }
      }
    }

    return output;
  }

  public async getProjectRuntime() {
    const path = this.runtimesPath;
    const output = [];

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

  public async copyProjectTemplateTo(templateId: string, ref: LocationRef): Promise<LocationRef> {
    const template = find(this.projectTemplates, { id: templateId });
    if (template === undefined || template.path === undefined) {
      throw new Error(`no such template with id ${templateId}`);
    }

    const runtime = find(this.runtimeTemplates, { id: DEFAULT_RUNTIME });
    if (runtime === undefined || runtime.path === undefined) {
      throw new Error(`no such runtime with id ${DEFAULT_RUNTIME}`);
    }

    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      throw new Error('already have this folder, please give another name');
    }

    // copy Composer data files
    await copyDir(template.path, this.templateStorage, dstDir, dstStorage);

    // copy runtime code files
    await copyDir(runtime.path, this.templateStorage, dstDir, dstStorage);

    return ref;
  }
}
