let mock = jest.createMockFromModule('@azure/arm-cognitiveservices');

mock.CognitiveServicesManagementClient = () => {
  return {
    accounts: {
      create: async () => {},
      list: async () => {
        return [
          {
            kind: 'LUIS.Authoring',
            id: '/stuff/resourceGroups/mockedGroup/stuff',
            name: 'mockedAccount',
            location: 'westus',
          },
        ];
      },
      listKeys: async () => {
        return {
          key1: 'mockedKey',
        };
      },
    },
  };
};

module.exports = mock;
