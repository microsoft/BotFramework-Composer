import { FileUpdateType } from '../../../src/models/bot/interface';
import { Path } from '../../../src/utility/path';

import { LuPublisher } from './../../../src/models/bot/luPublisher';
import service from './../../../src/services/storage';

const botDir = Path.join(__dirname, '../../mocks/samplebots/bot1');
const storage = service.getStorageClient('default');

describe('luis status management', () => {
  it('will get luis status', async () => {
    const luPublisher = new LuPublisher(botDir, storage);
    const status = await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu', 'bot1/Main.lu']);
    expect(status['bot1/a.lu'].lastUpdateTime).toBe(1);
    expect(status['bot1/a.lu'].lastPublishTime).toBe(0);
  });

  it('can update luis status', async () => {
    const luPublisher = new LuPublisher(botDir, storage);

    await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu', 'bot1/Main.lu']);
    const oldUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;

    await luPublisher.onFileChange('bot1/a.lu', FileUpdateType.UPDATE);
    const newUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;
    // update should increase the update time
    expect(newUpdateTime).toBeGreaterThan(oldUpdateTime);
  });
});

describe('get unpublishedFiles', () => {
  it('will get unpublished files', async () => {
    const lufiles = [
      {
        diagnostics: [],
        id: 'a',
        relativePath: 'bot1/a.lu',
        content: '',
        parsedContent: {},
      },
      {
        diagnostics: [],
        id: 'b',
        relativePath: 'bot1/b.lu',
        content: '',
        parsedContent: {},
      },
    ];

    const luPublisher = new LuPublisher(botDir, storage);
    await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu']); // relative path is key

    let files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(2);
    const curTime = Date.now();
    luPublisher.status['bot1/a.lu'].lastPublishTime = curTime; // assumming we publish a.lu
    luPublisher.status['bot1/b.lu'].lastPublishTime = curTime; // and b.lu
    files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(0);

    await luPublisher.onFileChange('bot1/a.lu', FileUpdateType.UPDATE);
    files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(1);
  });
});
