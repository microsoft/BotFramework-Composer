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
  it('visitor should walk through every node', () => {
    const visitedPath: string[] = [];
    const visitor: VisitorFunc = (path: string, _value: any) => {
      visitedPath.push(path);
      return false;
    };
    JsonWalk('$', data, visitor);
    const lastPath = visitedPath.pop();
    expect(visitedPath.length).toBe(14);
    expect(lastPath).toBe('$.phoneNumbers[:1].number');
  });

  it('if visitor stop, its children should not be visited', () => {
    const visitedPath: string[] = [];
    const visitor: VisitorFunc = (path: string, _value: any) => {
      // jump over phoneNumbers
      if (/phoneNumbers/.exec(path)) {
        return true;
      }
      visitedPath.push(path);
      return false;
    };
    JsonWalk('$', data, visitor);
    expect(visitedPath.length).toBe(8);
    expect(visitedPath.indexOf('$.phoneNumbers[:1].number')).toBe(-1);
  });
});
