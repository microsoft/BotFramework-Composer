process.env.NODE_ENV = 'production';
process.env.DEBUG = 'composer*';

jest.mock('electron', () => ({
  app: {
    getVersion: jest.fn().mockReturnValue('v1.0.0'),
  },
}));
