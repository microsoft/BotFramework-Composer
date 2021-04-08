// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const missingDotnetVersionError = {
  message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
  linkAfterMessage: {
    text: formatMessage('Learn more.'),
    url: 'https://aka.ms/install-composer',
  },
  link: {
    text: formatMessage('Install Microsoft .NET Core SDK'),
    url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
  },
};

export const checkIfDotnetVersionMissing = (err: { message: string }) => {
  return /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(err.message as string);
};
