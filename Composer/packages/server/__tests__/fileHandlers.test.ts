import { getFiles, updateFile } from '../src/handlers/fileHandler';
import { join } from 'path';

const mockFilePath: string = join(__dirname, 'mockFile/1.botproj');

describe('fileHandlers', () => {
  it('should get files at a path', () => {
    var files: any[] = getFiles(mockFilePath);
    expect(files.length).toBe(2);
  });

  it('should update a file at a path', () => {
    const initValue: string = 'old value';
    const newVaule: string = 'new value';

    var files: any[] = getFiles(mockFilePath);
    updateFile(files[1].name, newVaule);
    files = getFiles(mockFilePath);

    expect(files[1].content).toBe(newVaule);
    updateFile(files[1].name, initValue);
  });
});
