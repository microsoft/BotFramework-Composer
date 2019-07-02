import { NodeRenderer } from '../../../src/components/shared/NodeRenderer';
import * as RendererCollection from '../../../src/components/nodes/index';

test('every renderer should use sharedProps', () => {
  [NodeRenderer, ...Object.values(RendererCollection)].forEach(renderer => {
    expect(renderer.defaultProps).toBeTruthy();
    expect(renderer.defaultProps.id).toBe('');
    expect(renderer.defaultProps.data).toEqual({});
    expect(renderer.defaultProps.onEvent).toBeTruthy();
  });
});
