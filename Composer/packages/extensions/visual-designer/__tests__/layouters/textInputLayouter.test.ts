import { textInputLayouter } from '../../src/layouters/textInputLayouter';

describe('textInputLayouter', () => {
  let id;

  beforeEach(() => {
    id = 'events[0].actions[0]';
  });

  it('should reuturn a graphLayout with correct nodes', () => {
    const { nodeMap } = textInputLayouter(id);

    const nodeKeys = Object.keys(nodeMap);
    expect(nodeKeys.length).toEqual(6);
    expect(nodeKeys.filter(x => x.indexOf('diamond') > -1).length).toEqual(2);
    expect(nodeKeys.filter(x => x.indexOf('Prompt') > -1).length).toEqual(3);

    expect(nodeMap.initPrompt).toBeTruthy();
    expect(nodeMap.propertyBox).toBeTruthy();
    expect(nodeMap.unrecognizedPrompt).toBeTruthy();
    expect(nodeMap.invalidPrompt).toBeTruthy();
    expect(nodeMap.diamond1).toBeTruthy();
    expect(nodeMap.diamond2).toBeTruthy();
  });

  it('should reuturn a graphLayout with correct edges', () => {
    const { edges } = textInputLayouter(id);
    expect(edges.length).toEqual(10);
    expect(edges.filter(e => e.direction === 'x').length).toEqual(3);
    expect(edges.filter(e => e.direction === 'y').length).toEqual(7);
    expect(edges.filter(e => e.invertDirected).length).toEqual(3);
  });
});
