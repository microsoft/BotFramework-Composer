import { getExtension, getBaseName, upperCaseName } from '../../src/utils';

const files = ['a.text', 'a.b.text', 1];

describe('getExtension', () => {
  it('returns extension', () => {
    const result1 = getExtension(files[0]);
    expect(result1).toEqual('text');
    const result2 = getExtension(files[1]);
    expect(result2).toEqual('text');
    const result3 = getExtension(files[2]);
    expect(result3).toEqual(1);
  });
});

describe('getBaseName', () => {
  it('returns basename', () => {
    const result1 = getBaseName(files[0]);
    expect(result1).toEqual('a');
    const result2 = getBaseName(files[1]);
    expect(result2).toEqual('a.b');
    const result3 = getBaseName(files[2]);
    expect(result3).toEqual(1);
  });
});

describe('upperCaseName', () => {
  it('returns upper case name', () => {
    const result1 = upperCaseName(files[0]);
    expect(result1).toEqual('A.text');
    const result2 = upperCaseName(files[1]);
    expect(result2).toEqual('A.b.text');
    const result3 = upperCaseName(files[2]);
    expect(result3).toEqual(1);
  });
});
