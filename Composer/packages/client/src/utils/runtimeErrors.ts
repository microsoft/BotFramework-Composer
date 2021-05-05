// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const missingDotnetVersionError = {
  message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
  linkAfterMessage: {
    text: formatMessage('Learn more'),
    url: 'https://aka.ms/install-composer',
  },
  link: {
    text: formatMessage('Install Microsoft .NET Core SDK'),
    url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
  },
};

export const missingFunctionsError = {
  message: formatMessage('To run this bot, Composer needs Azure Functions Core Tools.'),
  linkAfterMessage: {
    text: formatMessage('Learn more'),
    url:
      'https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools',
  },
  link: {
    text: formatMessage('Install Azure Functions'),
    url: 'https://www.npmjs.com/package/azure-functions-core-tools',
  },
};

export const checkIfDotnetVersionMissing = (err: { message: string }) => {
  return /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(err.message as string);
};

export const checkIfFunctionsMissing = (err: { message: string }) => {
  return /(Azure Functions runtime not installed.)|(spawn func ENOENT)/.test(err.message as string);
};
