import path from 'path';

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: path.resolve(__dirname, '../../../../../SampleBots'),
    },
  ],
  recentBotProjects: [
    {
      storageId: 'default',
      path: path.resolve(__dirname, '../../../../../SampleBots/ToDoBot'),
    },
  ],
};
