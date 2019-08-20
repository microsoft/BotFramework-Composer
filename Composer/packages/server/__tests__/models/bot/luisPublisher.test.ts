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

  it('will can update luis status', async () => {
    const luPublisher = new LuPublisher(botDir, storage);

    await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu', 'bot1/Main.lu']);
    const oldUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;

    await luPublisher.onFileChange('bot1/a.lu', 'update');
    const newUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;
    // update should increase the update time
    expect(newUpdateTime).toBeGreaterThan(oldUpdateTime);
  });
});

describe('get unpublisedFiles', () => {
  it('will get unpublished files', async () => {
    const lufiles = [
      {
        diagnostics: [],
        id: 'a',
        relativePath: '/bot1/a.lu',
        content: '',
        parsedContent: {},
      },
    ];
    const luPublisher = new LuPublisher(botDir, storage);
    luPublisher.loadStatus(['/bot1/a.lu']); // relative path is key
    const files = await luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(1);
  });
});
