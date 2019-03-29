import { join } from 'path';

import { getFiles, updateFile, FileInfo } from '../src/handlers/fileHandler';

const mockFilePath: string = join(__dirname, 'mocks/1.botproj');

describe('fileHandlers', () => {
  it('should get files at a path', async () => {
    const files: FileInfo[] = await getFiles(mockFilePath);
    expect(files.length).toBe(2);
  });

  it('should update a file at a path', async () => {
    const initValue = { old: 'value' };
    const newVaule = { new: 'value' };

    let files: FileInfo[] = await getFiles(mockFilePath);
    await updateFile(files[1].name, JSON.stringify(newVaule), mockFilePath);
    files = await getFiles(mockFilePath);

    expect(files[1].content).toEqual(newVaule);
    await updateFile(files[1].name, JSON.stringify(initValue), mockFilePath);
  });
});
