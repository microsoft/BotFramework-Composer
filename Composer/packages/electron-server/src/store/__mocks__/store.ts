// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const Store = jest.fn(() => {
  const data = {
    storageConnections: [
      {
        id: 'default',
        name: 'This PC',
        type: 'LocalDisk',
        path: '.',
        defaultPath: '.',
      },
    ],
    recentBotProjects: [] as any[],
  } as any;
  return {
    Store: {
      get: (key: string) => {
        return data[key];
      },
      set: (key: string, value: any) => {
        data[key] = value;
      },
    },
  };
});
