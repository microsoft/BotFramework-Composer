let mock = jest.createMockFromModule('@azure/arm-resources');

mock.ResourceManagementClient = () => {
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
};

module.exports = mock;
