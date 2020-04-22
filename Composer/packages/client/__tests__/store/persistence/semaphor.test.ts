// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Semaphor from './../../../src/store/persistence/Semaphor';

function delay(tag: string, time: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ tag, time: new Date() }), time);
  });
}

describe('order the async function', () => {
  it('call the async function without await will be ordered by time ', async () => {
    async function test1() {
      return await delay('tag1', 20);
    }
    async function test2() {
      return await delay('tag2', 10);
    }
    const result = await Promise.all([test1(), test2()]);
    const tag1 = result[0].tag === 'tag1' ? result[0] : result[1];
    const tag2 = result[0].tag !== 'tag1' ? result[0] : result[1];
    expect(tag1.time > tag2.time).toBe(true);
  });

  it('call the async function with semaphor will be ordered by position ', async () => {
    async function test1() {
      const semaphor = new Semaphor();
      await semaphor.start();
      const result = await delay('tag1', 20);
      semaphor.end();
      return result;
    }
    async function test2() {
      const semaphor = new Semaphor();
      await semaphor.start();
      const result = await delay('tag2', 10);
      semaphor.end();
      return result;
    }
    const result = await Promise.all([test1(), test2()]);
    const tag1 = result[0].tag === 'tag1' ? result[0] : result[1];
    const tag2 = result[0].tag !== 'tag1' ? result[0] : result[1];
    expect(tag1.time < tag2.time).toBe(true);
  });
});
