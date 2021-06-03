jest.mock('@bfc/extension-client', () => {
  return {
    getAccessToken: () => 'accessToken',
    usePublishApi: () => ({
      setConfigIsValid: (valid) => null,
      setPublishConfig: (config) => null,
    }),
    fetch: jest.fn(() => ({ json: () => [] })),
  };
});
