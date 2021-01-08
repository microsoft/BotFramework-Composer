import { BotProjectProvision, ProvisionConfig } from './provision';

const mockConfig = {
  logger: console.log,
  accessToken: 'accessToken',
  graphToken: 'graphToken',
  hostname: 'hostname',
  externalResources: [],
  location: {
    id: 'local',
    name: 'local',
    displayName: 'westus'
  },
  luisLocation: '',
  name: 'profileName',
  type: 'azurepublish',
  subscription: {
    subscriptionId: 'subscriptionId',
    tenantId: 'tenant',
    displayName: 'test'
  },
} as ProvisionConfig;
const azProvision = new BotProjectProvision(mockConfig);

const mockGet = jest.fn();
jest.mock('request-promise', ()=>{
  return { get: async(...args) => await mockGet(args),
    RequestPromiseOptions: {}};
});

describe('provision', ()=>{
  it('test private method getTenantId', async ()=>{
    expect(typeof azProvision['getTenantId']).toBe('function');
    // mockGet.mockResolvedValueOnce({
    //   tenantId: 'test'
    // });
    // const tenantId = await azProvision['getTenantId']();
    // expect(tenantId).toBe('test');
  });
  it('test get error message', ()=> {

  })
})