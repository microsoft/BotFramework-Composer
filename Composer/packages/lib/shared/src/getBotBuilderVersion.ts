// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

/**
 * Function created to retrieve BotBuilder versions from BotFramework-Components repository containing the following example content as reference:
 *
 * ```js
 * // Copyright (c) Microsoft Corporation.
 * // Licensed under the MIT License.
 *
 * const dotnet = {
 *   name: 'dotnet',
 *   defaultSdkVersion: '4.18.1',
 * };
 *
 * const js = {
 *   name: 'js',
 *   defaultSdkVersion: '4.18.0-preview',
 * };
 *
 * module.exports = { dotnet, js };
 * ```
 */
const getField = (content: string, path: string) => {
  const [key, ...fields] = path.split('.');
  const objectPath = fields.reduce((acc, val, i, arr) => {
    const objKey = i < arr.length - 1 ? '{' : '';
    return acc + `.+?(?<=${val}:${objKey})`;
  }, '');
  const withQuotes = `('|")(.+?)('|")(}|,)`;
  const withoutQuotes = `\\w+|\\d+`;
  const pattern = `${key}={${objectPath}(${withQuotes}|${withoutQuotes})`;
  const oneLine = content.replace(/\r?\n|\r|\s+/g, '');
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = oneLine.match(new RegExp(pattern));
  if (!regex) {
    return;
  }
  const value = regex[1].match(withQuotes) ? regex[3] : regex[1];
  return value;
};

/**
 * Gets BotBuilder version for DotNet and JavaScript from BotFramework-Components repository.
 */
export const getBotBuilderVersion = async () => {
  const defaultValues = { dotnet: 'unknown', js: 'unknown' };
  try {
    const url =
      'https://raw.githubusercontent.com/microsoft/botframework-components/main/generators/generator-bot-adaptive/platforms.js';
    const { data } = await axios.get(url);
    const version = {
      dotnet: getField(data, 'dotnet.defaultSdkVersion') || defaultValues.dotnet,
      js: getField(data, 'js.defaultSdkVersion') || defaultValues.js,
    };
    return version;
  } catch (e) {
    console?.error(e);
    return defaultValues;
  }
};
