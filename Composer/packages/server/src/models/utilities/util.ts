// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';

import axios from 'axios';

export const getDialogNameFromFile = (file: string) => {
  const tokens = file.split('.');
  const length = tokens.length;
  let dialogName = '';
  if (length > 1) {
    const extension = tokens[length - 1];
    switch (extension) {
      case 'dialog':
      case 'lu':
      case 'lg':
      case 'qna':
        dialogName = tokens[0];
        break;
    }
  }
  return dialogName;
};

const urlRegex = /^http[s]?:\/\/\w+/;
const filePathRegex = /([^<>/\\:""]+\.\w+$)/;

export const getRemoteFile = async (url): Promise<string> => {
  if (urlRegex.test(url)) {
    const response = await axios.get(url);
    return response.data as string;
  } else if (filePathRegex.test(url)) {
    // get local manifest
    const content = await promisify(readFile)(url, { encoding: 'UTF-8' });
    return content as string;
  }
  return '';
};

// convert zip folder name to skill name
export const convertFolderNameToSkillName = (pathStr, skillName) => {
  const folderName = path.parse(pathStr).dir;
  const relativePath = path.relative(folderName, pathStr);

  return path.join(skillName, relativePath).replace('\\', '/');
};
