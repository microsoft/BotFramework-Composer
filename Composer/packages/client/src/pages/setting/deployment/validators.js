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
import formatMessage from 'format-message';

import { regionOptions } from './luisRegions.js';

export const validateName = name => {
  if (name.length === 0) {
    return formatMessage('Bot name is a required field');
  }
  return true;
};

export const validateEnvironment = name => {
  if (name.length === 0) {
    return formatMessage('Environment name is a required field');
  }
  return true;
};

export const validateRegion = region => {
  if (!region || !region.key) {
    return formatMessage('Azure region is a required field');
  }
  if (
    regionOptions.filter(r => {
      return r.key === region.key;
    }).length === 0
  ) {
    return formatMessage('Select an Azure region from the list');
  }
  return true;
};

// 16 characters at least one special char
export const validateSecret = val => {
  if (val.length !== 16) {
    return formatMessage('App secret must be exactly 16 characters long');
  }
  if (!val.match(/[a-z]/i)) {
    return formatMessage('App secret must contain at least 1 alpha character');
  }
  if (!val.match(/[0-9]/)) {
    return formatMessage('App secret must contain at least 1 number');
  }
  // eslint-disable-next-line no-useless-escape
  if (!val.match(/[!@$%^&#\?\.\+\*_\-\(\)\[\]]/)) {
    return formatMessage('App secret must contain at least 1 special character');
  }

  return true;
};
