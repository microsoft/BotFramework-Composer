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
