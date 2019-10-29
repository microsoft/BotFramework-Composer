/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { IFileStorage } from '../models/storage/interface';

/**
 * Copy a dir from one storage to another storage
 * @param srcDir path of the src dir
 * @param srcStorage src storage
 * @param dstDir path of the dst dir
 * @param dstStorage dst storage
 */
export async function copyDir(srcDir: string, srcStorage: IFileStorage, dstDir: string, dstStorage: IFileStorage) {
  if (!(await srcStorage.exists(srcDir)) || !(await srcStorage.stat(srcDir)).isDir) {
    throw new Error(`No such dir ${srcDir}}`);
  }

  if (!(await dstStorage.exists(dstDir))) {
    await dstStorage.mkDir(dstDir, { recursive: true });
  }

  const paths = await srcStorage.readDir(srcDir);
  for (const path of paths) {
    const srcPath = `${srcDir}/${path}`;
    const dstPath = `${dstDir}/${path}`;

    // eslint-disable-next-line no-console
    console.log(`copying ${srcPath} to ${dstPath}`);

    if ((await srcStorage.stat(srcPath)).isFile) {
      // copy files
      const content = await srcStorage.readFile(srcPath);
      await dstStorage.writeFile(dstPath, content);
    } else {
      // recursively copy dirs
      await copyDir(srcPath, srcStorage, dstPath, dstStorage);
    }
  }
}
