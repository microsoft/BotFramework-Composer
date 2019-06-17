import { JsonWalk, VisitorFunc } from '../../../server/src/utility/jsonWalk';

const data = {
  firstName: 'John',
  lastName: 'doe',
  age: 26,
  address: {
    streetAddress: 'naist street',
    city: 'Nara',
    postalCode: '630-0192',
  },
  phoneNumbers: [
    {
      type: 'iPhone',
      number: '0123-4567-8888',
    },
    {
      type: 'home',
      number: '0123-4567-8910',
    },
  ],
};

describe('run json walk', () => {
  it('should run successfully', async () => {
    let visitedPath: string[] = [];
    const visitor: VisitorFunc = (path: string, value: any) => {
      visitedPath.push(path);
      return false;
    };
    JsonWalk('$', data, visitor);
    const lastPath = visitedPath.pop();
    expect(lastPath).toBe('$.phoneNumbers[:1].number');
  });
});
