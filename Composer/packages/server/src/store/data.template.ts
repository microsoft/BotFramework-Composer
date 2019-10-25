import path from 'path';

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: path.resolve(__dirname, '../../../../../MyBots'),
    },
  ],
  recentBotProjects: [
    {
      storageId: 'default',
      path: path.resolve(__dirname, '../../../../../MyBots/ToDoBot'),
    },
  ],
};
