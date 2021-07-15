let mock = jest.createMockFromModule('@azure/arm-resources');

function ResourceManagementClient() {
  return {
    resourceGroups: {
      list: async () => {
        return [
          {
            id: 'mockedGroup',
            name: 'mockedGroup',
            region: 'westus',
          },
        ];
      },
    },
  };
}

mock.ResourceManagementClient = ResourceManagementClient;

module.exports = mock;
