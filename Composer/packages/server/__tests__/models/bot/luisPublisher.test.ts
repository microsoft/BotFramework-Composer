import mock from 'mock-fs';

import { LuPublisher } from './../../../src/models/bot/luPublisher';
import service from './../../../src/services/storage';

jest.mock('azure-storage', () => {
  return {};
});

const bot1Dir = '/path/to/fake/bot1';
const bot2Dir = '/path/to/fake/bot2';
const luFile1Path = '/path/to/fake/bot1/a.lu';
const luFile2Path = '/path/to/fake/bot2/a.lu';

const luisConfig = {
  authoringKey: '111111111111',
  authoringRegion: 'westus',
  defaultLanguage: 'en-us',
  environment: 'test',
  name: 'test',
};

const storage = service.getStorageClient('default');

beforeEach(() => {
  mock({
    '/path/to/fake/bot1': {
      'a.lu': ` # Greeting 
      - hi`,
    },
    '/path/to/fake/bot2': {
      'a.lu': ` # Greeting 
      - hi`,
      generated: {
        'a.en-us.lu.dialog': '',
        'luis.settings.test.westus.json': `
        {
          "luis": {
              "a_en-us_lu": "e094b572-2127-4403-8052-cd7a49ec5848"
          },
          "status": {
              "a_en-us_lu": {
                  "version": "0000000005",
                  "state": "published"
              }
          }
      }
        `,
      },
    },
  });
});

afterEach(mock.restore);

describe.skip('getLuisStatus', () => {
  it('will get luis status', async () => {
    const luPublisher = new LuPublisher(bot2Dir, storage);
    const settings = await luPublisher.getLuisStatus();
    expect(settings[0].name).toEqual('a.lu');
    expect(settings[0].state).toBe('published');
  });
});

describe.skip('getUnpublisedFiles', () => {
  it('will get unpublished files when no setting.json exist', async () => {
    const lufiles = [
      {
        diagnostics: [],
        id: 'a.lu',
        relativePath: '/path/to/fake/bot1/a.lu',
        content: '',
        parsedContent: {},
      },
    ];
    const luPublisher = new LuPublisher(bot1Dir, storage);
    luPublisher.setLuisConfig(luisConfig);
    const files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(1);
  });

  it('will get unpublished files when setting.json exist', async () => {
    const lufiles = [
      {
        diagnostics: [],
        id: 'a.lu',
        relativePath: '/path/to/fake/bot2/a.lu',
        content: '',
        parsedContent: {},
      },
    ];
    const luPublisher = new LuPublisher(bot2Dir, storage);
    luPublisher.setLuisConfig(luisConfig);
    const files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(0);
  });
});

describe.skip('update', () => {
  it('will not update the statuse if no setting.json', async () => {
    const luPublisher = new LuPublisher(bot1Dir, storage);
    await luPublisher.update(true, luFile1Path, luisConfig);
    const settings = await luPublisher.getLuisStatus();
    expect(settings).toEqual([]);
  });

  it('update the statuse if setting.json exist', async () => {
    const luPublisher = new LuPublisher(bot2Dir, storage);
    await luPublisher.update(false, luFile2Path, luisConfig);
    let settings = await luPublisher.getLuisStatus();
    expect(settings[0].state).toBe('published');
    await luPublisher.update(true, luFile2Path, luisConfig);
    settings = await luPublisher.getLuisStatus();
    expect(settings[0].state).toBe('unpublished');
  });
});
